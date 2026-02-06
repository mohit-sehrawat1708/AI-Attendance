
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layout } from './components/Layout';
import { UploadSchedule } from './components/UploadSchedule';
import { ScheduleList } from './components/ScheduleList';
import { AttendanceStats } from './components/AttendanceStats';
import { ScheduleItem, AttendanceRecord, AttendanceStatus, OverallStats } from './types';
import { useAuth } from './context/AuthContext';
import { LogOut, Save } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
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
        if (confirm("Are you sure you want to clear all data?")) {
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
        return <div className="flex items-center justify-center min-h-screen bg-gray-50 text-indigo-600">Loading your data...</div>;
    }

    const hasSchedule = schedule.length > 0;

    return (
        <div className="relative">
            <div className="bg-white border-b px-6 py-2 flex justify-between items-center text-sm fixed w-full top-0 right-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">Welcome, <strong>{user?.name}</strong></span>
                    {isSaving && <span className="text-xs text-gray-400 flex items-center gap-1"><Save size={12} className="animate-pulse" /> Saving...</span>}
                </div>
                <button onClick={logout} className="flex items-center gap-2 text-red-600 hover:text-red-700">
                    <LogOut size={16} /> Logout
                </button>
            </div>

            <div className="pt-12">
                <Layout onReset={handleReset} hasSchedule={hasSchedule}>
                    {!hasSchedule ? (
                        <UploadSchedule onScheduleGenerated={handleScheduleGenerated} />
                    ) : (
                        <div className="animate-fade-in">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                                <p className="text-gray-500">Track your progress and stay on top of your classes.</p>
                            </div>

                            <AttendanceStats stats={stats} />

                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Weekly Sheet</h3>
                            </div>

                            <ScheduleList
                                schedule={schedule}
                                records={records}
                                onUpdateRecord={handleRecordUpdate}
                            />
                        </div>
                    )}
                </Layout>
            </div>
        </div>
    );
};
