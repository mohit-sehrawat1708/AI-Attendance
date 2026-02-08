import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, HTMLMotionProps } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'hover' | 'interactive';
    noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className,
    variant = 'default',
    noPadding = false,
    ...props
}) => {
    const variants = {
        default: "bg-white/70 dark:bg-slate-800/60 border-white/20 dark:border-white/10",
        hover: "bg-white/70 dark:bg-slate-800/60 border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors duration-300",
        interactive: "bg-white/40 dark:bg-slate-800/40 border-white/10 dark:border-white/5 hover:bg-white/60 dark:hover:bg-slate-800/60 active:scale-[0.98] transition-all duration-200 cursor-pointer"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
                "backdrop-blur-xl border shadow-xl rounded-2xl overflow-hidden",
                variants[variant],
                noPadding ? "" : "p-6",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};
