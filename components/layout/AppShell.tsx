import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Settings,
    LogOut,
    Menu,
    X,
    Moon,
    Sun,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../ui/GlassCard';

interface AppShellProps {
    children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Calendar, label: 'Schedule', path: '/schedule' }, // Placeholder path
        { icon: Settings, label: 'Settings', path: '/settings' }, // Placeholder path
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={`min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-500 font-sans flex overflow-hidden`}>
            {/* Background Decor (Blobs) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[100px] animate-breathe" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-400/20 rounded-full blur-[100px] animate-breathe animation-delay-2000" />
            </div>

            {/* Sidebar (Desktop) */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="hidden md:flex flex-col w-64 m-4 mr-0 rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl z-20"
            >
                {/* Window Controls */}
                <div className="p-6 pb-2 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400 hover:bg-emerald-500 transition-colors shadow-sm" />
                </div>

                {/* User Profile Snippet */}
                <div className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'User'}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                        ? 'bg-white/50 dark:bg-slate-700/50 text-indigo-600 dark:text-indigo-400 font-medium shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-slate-700/30 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                                    />
                                )}
                                <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 mt-auto space-y-2">
                    <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-slate-700/30 transition-all"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-50">
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                    AttendAI
                </span>
                <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                    {isSidebarOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative p-4 md:p-6 pt-20 md:pt-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleSidebar}
                            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="md:hidden fixed top-0 right-0 bottom-0 w-64 bg-white dark:bg-slate-900 shadow-2xl z-50 p-6 flex flex-col"
                        >
                            {/* Mobile Sidebar Content - reused logic */}
                            <div className="flex justify-between items-center mb-8">
                                <span className="font-bold text-xl">Menu</span>
                                <button onClick={toggleSidebar}><X /></button>
                            </div>

                            <nav className="space-y-2 flex-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={toggleSidebar}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>

                            <div className="mt-auto space-y-3">
                                <button onClick={() => { toggleDarkMode(); toggleSidebar(); }} className="flex items-center gap-3 px-4 py-3 w-full">
                                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                </button>
                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-rose-500">
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
