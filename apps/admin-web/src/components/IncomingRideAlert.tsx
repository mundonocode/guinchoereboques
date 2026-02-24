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
    distancia_estimada_km: number;
    valor: number;
    endereco_origem?: string;
    veiculo_modelo?: string;
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

        // Tocar sound notification nativo html5 com pre-load
        if (alertAudio) {
            alertAudio.currentTime = 0;
            alertAudio.play().catch(e => console.log('Audio autoplay prevented:', e));
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

    if (!mounted) return null;

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
                    <div className="absolute inset-0 bg-[#1c1c1e]/98 backdrop-blur-2xl" />

                    {/* Conteúdo Principal */}
                    <div className="relative z-10 w-full h-[100dvh] flex flex-col justify-between pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+20px)] px-5">

                        <div className="flex-1 flex flex-col justify-center items-center">
                            {/* Timer Circle Animado */}
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                                className="w-[140px] h-[140px] rounded-full border-4 border-white flex justify-center items-center mb-10"
                            >
                                <span className="text-[42px] font-black text-white">{timeLeft}s</span>
                            </motion.div>

                            <h2 className="text-[28px] font-black text-white mb-2">Nova Chamada!</h2>
                            <p className="text-base text-zinc-400 mb-8">Você tem um serviço próximo</p>

                            <p className="text-sm text-zinc-300 text-center mb-10 px-5 line-clamp-2">
                                📍 Destino: {request.endereco_origem?.split('-')[0] || 'Endereço Indisponível'}
                            </p>

                            {/* Cards Row */}
                            <div className="flex flex-row justify-between w-full gap-3">
                                <div className="flex-1 bg-zinc-800 rounded-2xl py-4 px-2 flex flex-col items-center justify-center">
                                    <span className="text-[10px] text-zinc-400 font-bold mb-1 uppercase tracking-wider">Distância</span>
                                    <span className="text-base font-extrabold text-white">{request.distancia_estimada_km.toFixed(1).replace('.', ',')} km</span>
                                </div>
                                <div className="flex-1 bg-zinc-800 rounded-2xl py-4 px-2 flex flex-col items-center justify-center">
                                    <span className="text-[10px] text-zinc-400 font-bold mb-1 uppercase tracking-wider">Veículo</span>
                                    <span className="text-base font-extrabold text-white line-clamp-1">{request.veiculo_modelo || 'Sedan'}</span>
                                </div>
                                <div className="flex-1 bg-emerald-900 rounded-2xl py-4 px-2 flex flex-col items-center justify-center">
                                    <span className="text-[10px] text-emerald-400 font-bold mb-1 uppercase tracking-wider">Ganho</span>
                                    <span className="text-lg font-black text-emerald-500">R$ {request.valor.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex flex-row gap-4 pt-5 pb-5 w-full shrink-0">
                            <button
                                onClick={onReject}
                                className="flex-1 h-[60px] rounded-2xl bg-zinc-700 flex items-center justify-center active:bg-zinc-600 transition-colors"
                            >
                                <span className="text-white text-base font-bold">Recusar</span>
                            </button>
                            <button
                                onClick={onAccept}
                                className="flex-1 h-[60px] rounded-2xl bg-emerald-500 flex items-center justify-center active:bg-emerald-600 transition-colors"
                            >
                                <span className="text-black text-lg font-black uppercase">Aceitar</span>
                            </button>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
