import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook } from 'lucide-react';

export function LandingFooter() {
    return (
        <footer className="w-full bg-black text-white pt-24 pb-8 px-6 md:px-12 border-t border-zinc-900">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-16 mb-20">
                {/* Brand & Description */}
                <div className="flex-1 max-w-sm space-y-6">
                    <div className="flex flex-col">
                        <img src="/footer-logo.png" alt="Guinchos e Reboques" className="h-16 w-auto object-contain object-left mb-2" />
                    </div>
                    <p className="text-[13px] font-medium text-white/70 leading-relaxed">
                        Com tecnologia avançada, profissionais credenciados e atendimento 24h, conectamos você à melhor solução de forma rápida e segura, sem burocracias.
                    </p>
                </div>

                {/* Useful Links */}
                <div className="flex-1 max-w-[200px] space-y-6">
                    <h4 className="text-[16px] font-bold text-white tracking-tight">Links úteis</h4>
                    <ul className="space-y-4 text-[13px] font-medium text-white/50">
                        <li><Link href="#para-usuarios" className="hover:text-amber-500 transition-colors">Para Usuários</Link></li>
                        <li><Link href="#para-profissionais" className="hover:text-amber-500 transition-colors">Para Profissionais</Link></li>
                        <li><Link href="#para-empresas" className="hover:text-amber-500 transition-colors">Para Empresas</Link></li>
                        <li><Link href="/privacidade" className="hover:text-amber-500 transition-colors border-b border-white/50 pb-0.5 inline-block hover:border-amber-500">Política de Privacidade</Link></li>
                    </ul>
                </div>

                {/* Download App & Socials */}
                <div className="flex-1 max-w-[200px] space-y-8">
                    <div className="space-y-4">
                        <h4 className="text-[16px] font-bold text-white tracking-tight">Faça o Download</h4>
                        <div className="flex flex-col gap-3">
                            <button className="bg-white hover:bg-zinc-200 transition-colors rounded-md px-4 py-2 flex items-center justify-center gap-3 w-[160px]">
                                <img src="/apple-icon.png" className="w-5 h-5 object-contain invert" alt="Apple" />
                                <div className="flex flex-col items-start leading-none text-black">
                                    <span className="text-[8px] uppercase tracking-widest font-medium">Download on the</span>
                                    <span className="font-bold text-[11px]">APPLE STORE</span>
                                </div>
                            </button>
                            <button className="bg-white hover:bg-zinc-200 transition-colors rounded-md px-4 py-2 flex items-center justify-center gap-3 w-[160px]">
                                <img src="/google-play-icon.png" className="w-5 h-5 object-contain" alt="Google Play" />
                                <div className="flex flex-col items-start leading-none text-black">
                                    <span className="text-[8px] uppercase tracking-widest font-medium">Download on the</span>
                                    <span className="font-bold text-[11px]">Google Play</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[15px] font-bold text-white tracking-tight">Redes Sociais</h4>
                        <div className="flex items-center gap-3">
                            <a href="#" className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center hover:bg-amber-400 transition-colors">
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
