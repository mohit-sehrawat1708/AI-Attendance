import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { OverallStats } from '../types';
import { GlassCard } from './ui/GlassCard';
import { motion } from 'framer-motion';

interface AttendanceStatsProps {
  stats: OverallStats;
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b']; // Green, Red, Amber

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  const data = [
    { name: 'Attended', value: stats.attendedClasses },
    { name: 'Missed', value: stats.missedClasses },
  ];

  // If no data, show a placeholder
  const hasData = stats.totalClasses > 0;

  const getMotivationalMessage = (percentage: number) => {
    if (percentage >= 90) return "Excellent! Keep it up! 🌟";
    if (percentage >= 75) return "Good job, you're on track. 👍";
    if (percentage >= 60) return "Warning: Attendance is slipping. ⚠️";
    return "Critical: You need to attend more classes! 🚨";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Percentage Card */}
      <GlassCard className="relative overflow-hidden min-h-[220px] flex flex-col justify-center">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        <h3 className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide text-xs mb-4 text-center">Overall Attendance</h3>

        <div className="flex items-baseline justify-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="text-6xl font-bold text-slate-900 dark:text-white"
          >
            {hasData ? Math.round(stats.percentage) : 0}
          </motion.span>
          <span className="text-3xl text-slate-400 dark:text-slate-500 ml-1">%</span>
        </div>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`mt-6 text-sm font-medium px-4 py-1.5 rounded-full text-center max-w-xs mx-auto ${stats.percentage >= 75
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
            }`}>
          {hasData ? getMotivationalMessage(stats.percentage) : "No data yet"}
        </motion.p>
      </GlassCard>

      {/* Chart Card */}
      <GlassCard className="h-[220px] flex flex-col">
        <h3 className="text-slate-900 dark:text-white font-semibold mb-2 text-center md:text-left">Breakdown</h3>
        <div className="flex-1 w-full min-h-0">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={COLORS[0]} /> {/* Attended */}
                  <Cell fill={COLORS[1]} /> {/* Missed */}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', opacity: 0.7 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-2"></div>
              <p>Mark attendance to see stats</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};