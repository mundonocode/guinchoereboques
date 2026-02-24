import React from 'react';
import Link from 'next/link';
import { Truck } from 'lucide-react';

export function LandingHeader() {
    return (
        <header className="w-full bg-black text-white py-4 px-6 md:px-12 flex items-center justify-between z-50 relative">
            <Link href="/" className="flex items-center gap-3 group">
                <img src="/logo-oficial.png.png" alt="Guinchos e Reboques" className="w-[140px] md:w-[160px] h-auto object-contain" />
            </Link>

            <nav className="hidden lg:flex items-center gap-10 text-[15px] font-bold tracking-wide text-white/90">
                <Link href="#para-usuarios" className="hover:text-amber-400 transition-colors">Para Usuários</Link>
                <Link href="#para-profissionais" className="hover:text-amber-400 transition-colors">Para Profissionais</Link>
                <Link href="#para-empresas" className="hover:text-amber-400 transition-colors">Para Empresas</Link>
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
