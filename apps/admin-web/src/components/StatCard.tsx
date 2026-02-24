import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface StatCardProps {
    title: string;
    value: string;
    subValue?: string;
    icon: LucideIcon;
    iconColor: string;
    iconBg: string;
    className?: string;
}

export function StatCard({
    title,
    value,
    subValue,
    icon: Icon,
    iconColor,
    iconBg,
    className
}: StatCardProps) {
    return (
        <div className={cn("bg-card p-6 rounded-xl border border-border shadow-soft flex flex-col justify-between min-h-[160px]", className)}>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform hover:scale-105", iconBg)}>
                <Icon size={24} color={iconColor} />
            </div>
            <div>
                <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                    {subValue && (
                        <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full",
                            subValue.startsWith('+') ? "text-emerald-500 bg-emerald-50" : "text-red-500 bg-red-50"
                        )}>
                            {subValue}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
