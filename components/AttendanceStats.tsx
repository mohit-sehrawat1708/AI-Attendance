import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { OverallStats } from '../types';
import { GlassCard } from './ui/GlassCard';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface AttendanceStatsProps {
  stats: OverallStats;
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = [
    { name: 'Present', value: stats.attendedClasses, color: '#10B981' }, // Emerald 500
    { name: 'Absent', value: stats.missedClasses, color: '#EF4444' },    // Red 500
    { name: 'Cancelled', value: stats.cancelledClasses, color: '#F97316' } // Orange 500
  ];

  const hasData = stats.totalClasses > 0 || stats.cancelledClasses > 0;

  const getMotivationalMessage = (percentage: number) => {
    if (percentage >= 90) return "Excellent! Keep it up!";
    if (percentage >= 75) return "Good job, you're on track.";
    if (percentage >= 60) return "Attendance is slipping.";
    return "You need to attend more classes.";
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Percentage Card */}
      <GlassCard className="relative overflow-hidden flex-none md:flex-1 flex flex-col justify-center bg-surface border-border min-h-[140px]">
        <h3 className="text-zinc-500 font-medium uppercase tracking-wide text-xs mb-2 text-center">Overall Attendance</h3>

        <div className="flex items-baseline justify-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="text-5xl lg:text-6xl font-bold text-text"
          >
            {hasData ? Math.round(stats.percentage) : 0}
          </motion.span>
          <span className="text-2xl text-zinc-500 ml-1">%</span>
        </div>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`mt-4 text-xs font-medium px-4 py-1.5 rounded-full text-center max-w-xs mx-auto border ${stats.percentage >= 75
            ? 'bg-transparent text-text border-border'
            : 'bg-transparent text-zinc-400 border-border'
            }`}>
          {hasData ? getMotivationalMessage(stats.percentage) : "No data yet"}
        </motion.p>
      </GlassCard>

      {/* Chart Card */}
      <GlassCard className="flex-1 flex flex-col bg-surface border-border min-h-[220px]">
        <h3 className="text-text font-semibold mb-2 text-center text-sm">Breakdown</h3>
        <div className="flex-1 w-full min-h-0">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: isDark ? '#A1A1AA' : '#52525B', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  dy={5}
                />
                <YAxis
                  tick={{ fill: isDark ? '#A1A1AA' : '#52525B', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: isDark ? '#FFFFFF10' : '#00000005' }}
                  contentStyle={{
                    backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #27272A' : '1px solid #E4E4E7',
                    color: isDark ? '#fff' : '#000',
                    fontSize: '12px',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ color: isDark ? '#fff' : '#000' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm">
              <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 mb-2"></div>
              <p className="text-xs">Mark attendance to see stats</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};