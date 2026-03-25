'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, Facebook } from 'lucide-react';

export function LandingFooter() {
    const pathname = usePathname();

    const isHome = pathname === '/';
    const isMotorista = pathname === '/cadastro-motorista';
    const isEmpresas = pathname === '/para-empresas';

    return (
        <footer className="w-full bg-black text-white pt-24 pb-8 px-6 md:px-12 border-t border-zinc-900">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-16 mb-20">
                {/* Brand & Description */}
                <div className="flex-1 max-w-sm space-y-6">
                    <Link href="/" className="flex flex-col w-fit">
                        <img src="/footer-logo.png" alt="Guinchos e Reboques" className="h-16 w-auto object-contain object-left mb-2" />
                    </Link>
                    <p className="text-[13px] font-medium text-white/70 leading-relaxed">
                        Com tecnologia avançada, profissionais credenciados e atendimento 24h, conectamos você à melhor solução de forma rápida e segura, sem burocracias.
                    </p>
                </div>

                {/* Useful Links */}
                <div className="flex-1 max-w-[200px] space-y-6">
                    <h4 className="text-[16px] font-bold text-white tracking-tight">Links úteis</h4>
                    <ul className="space-y-4 text-[13px] font-medium text-white/50">
                        <li>
                            <Link
                                href={isHome ? "#para-usuarios" : "/#para-usuarios"}
                                className="hover:text-amber-500 transition-colors"
                            >
                                Para Usuários
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={isMotorista ? "#" : "/cadastro-motorista"}
                                className="hover:text-amber-500 transition-colors"
                            >
                                Para Profissionais
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={isEmpresas ? "#" : "/para-empresas"}
                                className="hover:text-amber-500 transition-colors"
                            >
                                Para Empresas
                            </Link>
                        </li>
                        <li><Link href="#faq" className="hover:text-amber-500 transition-colors border-b border-white/50 pb-0.5 inline-block hover:border-amber-500">Política de Privacidade</Link></li>
                    </ul>
                </div>

                {/* Download App & Socials */}
                <div className="flex-1 max-w-[200px] space-y-8">
                    <div className="space-y-4">
                        <h4 className="text-[16px] font-bold text-white tracking-tight">Faça o Download</h4>
                        <div className="flex flex-col gap-4">
                            <button className="bg-black text-white hover:bg-zinc-800 transition-colors border border-zinc-800 rounded-xl px-5 py-2.5 flex items-center justify-center gap-3 w-full sm:w-auto min-w-[170px]">
                                <img src="/apple-icon.png" className="w-[24px] h-[24px] object-contain" alt="Apple" />
                                <div className="flex flex-col items-start leading-none text-left">
                                    <span className="text-[10px] text-zinc-300 mb-1">Baixar na</span>
                                    <span className="text-[16px] font-bold">App Store</span>
                                </div>
                            </button>
                            <button className="bg-black text-white hover:bg-zinc-800 transition-colors border border-zinc-800 rounded-xl px-5 py-2.5 flex items-center justify-center gap-3 w-full sm:w-auto min-w-[170px]">
                                <img src="/google-play-icon.png" className="w-[24px] h-[24px] object-contain" alt="Google Play" />
                                <div className="flex flex-col items-start leading-none text-left">
                                    <span className="text-[10px] text-zinc-300 mb-1">Disponível no</span>
                                    <span className="text-[16px] font-bold">Google Play</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[15px] font-bold text-white tracking-tight">Redes Sociais</h4>
                        <div className="flex items-center gap-3">
                            <a 
                                href="https://www.instagram.com/guinchosireboques?igsh=ZXo2MTh4dDB3OTRo" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center hover:bg-amber-400 transition-colors"
                            >
                                <Instagram size={18} className="text-black" />
                            </a>
                            <a href="#" className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center hover:bg-amber-400 transition-colors">
                                <Facebook size={18} className="text-black fill-black" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto flex">
                <p className="text-[11px] font-medium text-white/40">
                    Guincho e Reboque. Todos os Direitos Reservados.
                </p>
            </div>
        </footer>
    );
}
