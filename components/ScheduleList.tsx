import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, MapPin, X } from 'lucide-react';
import { ScheduleItem, AttendanceRecord, AttendanceStatus } from '../types';
import { Button } from './ui/Button';
import { GlassCard } from './ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

interface ScheduleListProps {
  schedule: ScheduleItem[];
  records: AttendanceRecord[];
  onUpdateRecord: (record: AttendanceRecord) => void;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ schedule, records, onUpdateRecord }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Format selected date to match schedule days
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = days[selectedDate.getDay()];

  // Filter classes for the selected day
  const todaysClasses = schedule
    .filter(item => item.day.toLowerCase() === currentDayName.toLowerCase())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getRecordForClass = (scheduleId: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return records.find(r => r.scheduleItemId === scheduleId && r.date === dateStr);
  };

  const handleStatusUpdate = (scheduleItem: ScheduleItem, status: AttendanceStatus) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const existing = getRecordForClass(scheduleItem.id);

    const newRecord: AttendanceRecord = {
      id: existing ? existing.id : crypto.randomUUID(),
      scheduleItemId: scheduleItem.id,
      date: dateStr,
      status: status,
      timestamp: Date.now(),
    };
    onUpdateRecord(newRecord);
  };

  const changeDate = (daysToAdd: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + daysToAdd);
    setSelectedDate(newDate);
  };

  return (
    <GlassCard className="overflow-hidden" noPadding>
      {/* Date Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-light/10 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm">
        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="text-xs text-indigo-500 dark:text-indigo-400 uppercase font-bold tracking-wider mb-0.5">{currentDayName}</div>
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            <span className="opacity-50 font-normal ml-1 hidden sm:inline">{selectedDate.getFullYear()}</span>
          </motion.div>
        </div>
        <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Class List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
        {todaysClasses.length === 0 ? (
          <div className="py-20 px-6 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 opacity-50" />
            </div>
            <p className="font-medium">No classes scheduled</p>
            <p className="text-sm opacity-70">Enjoy your free time!</p>
          </div>
        ) : (
          todaysClasses.map((item, index) => {
            const record = getRecordForClass(item.id);
            const status = record?.status;

            return (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={item.id}
                className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 gap-y-1">
                    <div className="flex items-center mr-4 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                      <Clock className="h-3 w-3 mr-1.5 text-indigo-500" />
                      {item.startTime} - {item.endTime}
                    </div>
                    {item.room && (
                      <div className="flex items-center px-2 py-0.5">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.room}
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white truncate pr-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.subject}</h4>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="grid grid-cols-2 gap-2 flex-1 md:flex-none">
                    <Button
                      size="sm"
                      variant={status === AttendanceStatus.PRESENT ? 'primary' : 'secondary'}
                      onClick={() => handleStatusUpdate(item, AttendanceStatus.PRESENT)}
                      className={`justify-center ${status === AttendanceStatus.PRESENT ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : ""}`}
                    >
                      <CheckCircle className={`h-4 w-4 mr-2 ${status === AttendanceStatus.PRESENT ? 'text-white' : 'text-emerald-600 dark:text-emerald-500'}`} />
                      Present
                    </Button>

                    <Button
                      size="sm"
                      variant={status === AttendanceStatus.ABSENT ? 'danger' : 'secondary'}
                      onClick={() => handleStatusUpdate(item, AttendanceStatus.ABSENT)}
                      className={`justify-center ${status === AttendanceStatus.ABSENT ? "" : "text-rose-600 dark:text-rose-500"}`}
                    >
                      <XCircle className={`h-4 w-4 mr-2 ${status === AttendanceStatus.ABSENT ? 'text-white' : 'text-rose-600 dark:text-rose-500'}`} />
                      Absent
                    </Button>
                  </div>

                  {status && status !== AttendanceStatus.CANCELLED && (
                    <button
                      onClick={() => handleStatusUpdate(item, AttendanceStatus.CANCELLED)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Clear Status"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
};