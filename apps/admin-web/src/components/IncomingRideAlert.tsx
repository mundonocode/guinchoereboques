'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Navigation, Clock, ShieldCheck, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Pré-carrega o áudio fora do fluxo de renderização do React para evitar atrasos e garbage collection
let alertAudio: HTMLAudioElement | null = null;
if (typeof window !== 'undefined') {
    alertAudio = new Audio('https://www.soundjay.com/buttons/beep-07.mp3');
    alertAudio.preload = 'auto';
}

interface RideRequest {
    id: string;
    distancia_km?: number | null;
    valor: number | null;
    origem_endereco?: string;
    destino_endereco?: string;
    veiculo_marca_modelo?: string;
    veiculo_cor?: string;
    veiculo_placa?: string;
    problema_tipo?: string;
    problema_descricao?: string;
}

interface IncomingRideAlertProps {
    request: RideRequest | null;
    onAccept: () => void;
    onReject: () => void;
}

export function IncomingRideAlert({ request, onAccept, onReject }: IncomingRideAlertProps) {
    const [timeLeft, setTimeLeft] = useState(30);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!request) {
            setTimeLeft(30);
            return;
        }

        console.log("DEBUG: IncomingRideAlert received request:", request);

        // Tocar sound notification nativo html5 com pre-load
        if (alertAudio) {
            alertAudio.currentTime = 0;
            const playPromise = alertAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log('Audio autoplay prevented or source not found:', e.message);
                });
            }
        }

        const intervalId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalId);
                    onReject();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [request, onReject]);

    if (!mounted) {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            {request && (
                <motion.div
                    key="incoming-ride-alert"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-end overflow-hidden"
                >
                    {/* Fundo Liquid Glass */}
                    <div className="absolute inset-0 bg-[#0c0c0e]/75 backdrop-blur-2xl" />

                    {/* Conteúdo Principal */}
                    <div className="relative z-10 w-full h-[100dvh] flex flex-col justify-end px-6 pb-[calc(env(safe-area-inset-bottom,20px)+20px)] max-w-lg mx-auto">

                        <div className="bg-[#1c1c1e] rounded-[40px] shadow-2xl overflow-hidden border border-white/5 p-6 md:p-8 animate-in slide-in-from-bottom duration-500">
                            {/* Timer Header Section */}
                            <div className="flex flex-col items-center mb-8 pt-2">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                                    className="w-[88px] h-[88px] rounded-full border-[3px] border-white flex justify-center items-center mb-5 bg-white/5"
                                >
                                    <span className="text-[28px] font-black text-white">{timeLeft}s</span>
                                </motion.div>
                                <h1 className="text-2xl font-black text-white text-center tracking-tight">Nova Chamada de Serviço!</h1>
                                <p className="text-zinc-500 text-[13px] text-center mt-1 font-bold uppercase tracking-widest">Guincho Próximo</p>
                            </div>

                            {/* Route Section - Glass Box */}
                            <div className="bg-zinc-800/40 border border-white/5 rounded-[28px] p-5 mb-4">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center py-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]" />
                                        <div className="w-[1.5px] flex-1 bg-white/10 my-1.5 rounded-full" />
                                        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-zinc-500 tracking-[0.12em] uppercase mb-1">Local de Retirada</span>
                                            <span className="text-[14px] font-bold text-white leading-snug line-clamp-2">
                                                {request.origem_endereco || 'Local não informado'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-zinc-500 tracking-[0.12em] uppercase mb-1">Destino Final</span>
                                            <span className="text-[14px] font-bold text-white leading-snug line-clamp-2">
                                                {request.destino_endereco || 'Destino não informado'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-zinc-800/40 border border-white/5 rounded-[24px] p-4 flex flex-col items-center">
                                    <span className="text-[9px] font-black text-zinc-500 tracking-wider uppercase mb-1">Distância</span>
                                    <span className="text-xl font-black text-white">
                                        {(request.distancia_km ?? 0).toFixed(1).replace('.', ',')} km
                                    </span>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] p-4 flex flex-col items-center">
                                    <span className="text-[9px] font-black text-emerald-400 tracking-wider uppercase mb-1">Ganho Líquido</span>
                                    <span className="text-xl font-black text-emerald-500">
                                        R$ {(request.valor ?? 0).toFixed(0)}
                                    </span>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="bg-zinc-800/40 border border-white/5 rounded-[28px] p-5 mb-8">
                                <div className="mb-4">
                                    <span className="text-[9px] font-black text-zinc-500 tracking-wider uppercase mb-2 block">Dados do Veículo</span>
                                    <p className="text-[15px] font-bold text-white">{request.veiculo_marca_modelo || 'Mercedes-Benz Sprinter'}</p>
                                    <p className="text-[12px] text-zinc-500 font-bold mt-0.5 uppercase tracking-wide">
                                        {request.veiculo_cor || 'Prata'} • {request.veiculo_placa || 'BRA2E19'}
                                    </p>
                                </div>
                                <div className="h-[1px] bg-white/5 my-4" />
                                <div>
                                    <span className="text-[9px] font-black text-zinc-500 tracking-wider uppercase mb-2 block">Tipo de Problema</span>
                                    <p className="text-[15px] font-bold text-red-400">{request.problema_tipo || 'Pane Mecânica'}</p>
                                    <p className="text-[13px] text-zinc-400 mt-1 line-clamp-1 italic">
                                        "{request.problema_descricao || 'O veículo parou subitamente no meio da via.'}"
                                    </p>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button
                                    onClick={onReject}
                                    className="h-[64px] rounded-[22px] bg-zinc-900 border border-white/5 flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all"
                                >
                                    <span className="text-zinc-500 text-[15px] font-black uppercase tracking-wider">Recusar</span>
                                </button>
                                <button
                                    onClick={onAccept}
                                    className="h-[64px] rounded-[22px] bg-emerald-500 flex items-center justify-center shadow-[0_8px_25px_rgba(16,185,129,0.3)] hover:bg-emerald-400 active:scale-95 transition-all"
                                >
                                    <span className="text-emerald-950 text-[16px] font-black uppercase tracking-tight">Aceitar Chamada</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
