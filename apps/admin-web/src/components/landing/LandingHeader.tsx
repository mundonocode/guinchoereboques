'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck } from 'lucide-react';

export function LandingHeader() {
    const pathname = usePathname();

    const isHome = pathname === '/';
    const isMotorista = pathname === '/cadastro-motorista';
    const isEmpresas = pathname === '/para-empresas';

    return (
        <header className="w-full bg-black text-white py-4 px-6 md:px-12 flex items-center justify-between z-50 relative">
            <Link href="/" className="flex items-center gap-3 group">
                <img src="/logo.png" alt="Guinchos e Reboques" className="w-[140px] md:w-[160px] h-auto object-contain" />
            </Link>

            <nav className="hidden lg:flex items-center gap-10 text-[15px] font-bold tracking-wide text-white/90">
                <Link
                    href={isHome ? "#para-usuarios" : "/#para-usuarios"}
                    className="hover:text-amber-400 transition-colors"
                >
                    Para Usuários
                </Link>
                <Link
                    href={isMotorista ? "#" : "/cadastro-motorista"}
                    className="hover:text-amber-400 transition-colors"
                >
                    Para Profissionais
                </Link>
                <Link
                    href={isEmpresas ? "#" : "/para-empresas"}
                    className="hover:text-amber-400 transition-colors"
                >
                    Para Empresas
                </Link>
                <Link href="#faq" className="hover:text-amber-400 transition-colors">FAQ</Link>
            </nav>

            <div className="flex items-center gap-4">
                <Link
                    href="/login"
                    className="bg-white text-black px-8 py-3.5 rounded-md font-black text-xs tracking-wider uppercase hover:bg-zinc-200 transition-all duration-300 hidden md:flex items-center justify-center shadow-lg"
                >
                    SOLICITAR GUINCHO AGORA
                </Link>
            </div>
        </header>
    );
}
