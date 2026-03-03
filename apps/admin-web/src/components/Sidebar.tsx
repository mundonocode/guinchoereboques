'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    Truck,
    Users,
    LineChart,
    Settings,
    LogOut,
    ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/contexts/AuthContext';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { name: 'Guincheiros', href: '/motoristas', icon: Truck },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Financeiro', href: '/financeiro', icon: LineChart },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { signOut } = useAuth();

    return (
        <div className="flex flex-col w-64 bg-sidebar border-r border-border min-h-screen p-6">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="bg-black p-2 rounded-lg">
                    <ShieldCheck color="#ffffff" size={24} />
                </div>
                <span className="text-xl font-bold tracking-tight">Painel Admin</span>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                isActive
                                    ? "bg-black text-white shadow-soft"
                                    : "text-muted hover:bg-gray-100"
                            )}
                        >
                            <item.icon size={20} color={isActive ? "#ffffff" : "#666"} strokeWidth={isActive ? 2.5 : 2} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto">
                <button
                    onClick={signOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-500 hover:bg-red-50 transition-colors font-medium"
                >
                    <LogOut size={20} />
                    <span>Sair do Painel</span>
                </button>
            </div>
        </div>
    );
}
