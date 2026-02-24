'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Wallet, User } from 'lucide-react';

export function MotoristaBottomNav() {
    const pathname = usePathname();

    const tabs = [
        { name: 'Mapa', href: '/motorista', icon: MapPin },
        { name: 'Carteira', href: '/motorista/carteira', icon: Wallet },
        { name: 'Perfil', href: '/motorista/perfil', icon: User },
    ];

    const isMainTab = tabs.some(tab => pathname === tab.href);
    if (!isMainTab) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-16 pointer-events-auto">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className="flex flex-col items-center justify-center flex-1 h-full"
                        >
                            <Icon
                                size={24}
                                className={`mb-1 transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400'}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
