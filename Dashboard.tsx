import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UploadSchedule } from './components/UploadSchedule';
import { ScheduleList } from './components/ScheduleList';
import { AttendanceStats } from './components/AttendanceStats';
import { ScheduleItem, AttendanceRecord, AttendanceStatus, OverallStats } from './types';
import { useAuth } from './context/AuthContext';
import { Save, RefreshCw, Trash2 } from 'lucide-react';
import { GlassCard } from './components/ui/GlassCard';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load data from Backend
    useEffect(() => {
        if (!user) return;

        fetch(`http://localhost:3001/api/data/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setSchedule(data.schedule || []);
                setRecords(data.records || []);
            })
            .catch(err => console.error("Failed to load data", err))
            .finally(() => setIsLoading(false));
    }, [user]);

    // Save data to Backend
    const saveData = useCallback(async (newSchedule: ScheduleItem[], newRecords: AttendanceRecord[]) => {
        if (!user) return;
        setIsSaving(true);
        try {
            await fetch(`http://localhost:3001/api/data/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schedule: newSchedule, records: newRecords }),
            });
        } catch (err) {
            console.error("Failed to save data", err);
        } finally {
            setIsSaving(false);
        }
    }, [user]);

    const handleScheduleGenerated = (newSchedule: ScheduleItem[]) => {
        setSchedule(newSchedule);
        saveData(newSchedule, records);
    };

    const handleRecordUpdate = (newRecord: AttendanceRecord) => {
        // Optimistic update
        const updatedRecords = records.filter(r =>
            !(r.scheduleItemId === newRecord.scheduleItemId && r.date === newRecord.date)
        );
        const newRecordsList = [...updatedRecords, newRecord];

        setRecords(newRecordsList);
        saveData(schedule, newRecordsList);
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
            setSchedule([]);
            setRecords([]);
            saveData([], []);
        }
    };

    // Calculate stats
    const stats: OverallStats = useMemo(() => {
        const totalClasses = records.filter(r => r.status !== AttendanceStatus.CANCELLED).length;
        const attendedClasses = records.filter(r =>
            r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE
        ).length;

        const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;

        return {
            totalClasses,
            attendedClasses,
            missedClasses: totalClasses - attendedClasses,
            percentage
        };
    }, [records]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-indigo-500">
                <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                <p className="font-medium animate-pulse">Syncing your data...</p>
            </div>
        );
    }

    const hasSchedule = schedule.length > 0;

    return (
        <div className="space-y-6 pb-20">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Overview
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Here's what's happening today, {user?.name.split(' ')[0]}.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isSaving && (
                        <span className="text-sm text-indigo-500 flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                            <Save size={14} className="animate-pulse" /> Saving...
                        </span>
                    )}
                    {hasSchedule && (
                        <button
                            onClick={handleReset}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                            title="Reset Data"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
            </div>

            {!hasSchedule ? (
                <GlassCard className="max-w-xl mx-auto mt-10 text-center py-12">
                    <div className="mb-6 inline-flex p-4 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500">
                        <CalendarIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        No Schedule Found
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                        Upload your timetable image to get started. We'll extract your classes automatically.
                    </p>
                    <UploadSchedule onScheduleGenerated={handleScheduleGenerated} />
                </GlassCard>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="space-y-6"
                >
                    {/* Stats Section */}
                    <AttendanceStats stats={stats} />

                    {/* Weekly Schedule */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Weekly Schedule</h2>
                        </div>
                        <ScheduleList
                            schedule={schedule}
                            records={records}
                            onUpdateRecord={handleRecordUpdate}
                        />
                    </div>
                </motion.div>
            )}
        </div>
    );
};

function CalendarIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    )
}
