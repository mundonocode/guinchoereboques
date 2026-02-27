'use client';

import React from 'react';

interface RideSearchingStatusProps {
    onCancel: () => void;
}

export function RideSearchingStatus({ onCancel }: RideSearchingStatusProps) {
    return (
        <div className="absolute bottom-0 left-0 right-0 z-[100] px-6 pb-[calc(env(safe-area-inset-bottom,20px)+20px)] pointer-events-none">
            <div className="max-w-lg mx-auto bg-white rounded-[32px] shadow-[0_-12px_40px_rgba(0,0,0,0.12)] border border-zinc-100 p-8 pointer-events-auto overflow-hidden">
                <div className="flex flex-col items-center">
                    {/* Radar Animation Rings */}
                    <div className="relative w-[100px] h-[100px] mb-8 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-[3px] border-zinc-50 shadow-inner" />
                        <div className="absolute inset-0 rounded-full border-[3px] border-zinc-900 border-t-transparent animate-spin duration-[2000ms]" />
                        <div className="w-11 h-11 bg-zinc-900 rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-black text-zinc-900 mb-3 tracking-tight text-center">Buscando resgate...</h3>
                    <p className="text-[14px] text-zinc-500 font-bold text-center mb-10 max-w-[280px] leading-relaxed uppercase tracking-wider">
                        Aguarde. Nossa rede de especialista está analisando sua solicitação em tempo real.
                    </p>

                    <button
                        onClick={onCancel}
                        className="w-full bg-red-50 text-red-600 font-black py-5 px-6 rounded-[22px] text-[15px] flex justify-center items-center transition-all hover:bg-red-100 active:scale-95"
                    >
                        Cancelar Solicitação
                    </button>
                </div>
            </div>
        </div>
    );
}
