'use client';

import React, { useState } from 'react';
import { Phone, Truck, Tag, User, X, MessageSquare } from 'lucide-react';
import { ChatModal } from '@/components/ChatModal';

interface RideActiveStatusProps {
    rideId: string;
    driverInfo: any;
    status?: string;
    onCancel: () => void;
}

export function RideActiveStatus({ rideId, driverInfo, status, onCancel }: RideActiveStatusProps) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const getStatusLabel = () => {
        switch (status) {
            case 'aceita':
            case 'a_caminho':
                return 'Guincheiro a Caminho';
            case 'no_local':
                return 'Guincheiro no Local';
            case 'em_andamento':
                return 'Em Rota para Destino';
            case 'finalizada':
                return 'Corrida Finalizada';
            default:
                return 'Acompanhando Corrida';
        }
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 z-[100] px-6 pb-[calc(env(safe-area-inset-bottom,20px)+20px)] pointer-events-none">
            <div className="max-w-lg mx-auto bg-white rounded-[40px] shadow-[0_-12px_60px_rgba(0,0,0,0.15)] overflow-hidden pointer-events-auto border border-zinc-100">
                {/* Header Status - Updated to Light Theme */}
                <div className="w-full bg-[#f8f9fa] py-4 flex justify-center border-b border-zinc-100">
                    <span className="text-[14px] font-black tracking-widest text-zinc-900 uppercase">
                        {status === 'aceita' || status === 'a_caminho' ? 'GUINCHEIRO A CAMINHO' : getStatusLabel().toUpperCase()}
                    </span>
                </div>

                <div className="p-6 md:p-8">
                    {/* Driver Profile Header */}
                    <div className="flex items-center mb-8 relative">
                        <div className="w-[72px] h-[72px] bg-zinc-50 rounded-full flex items-center justify-center mr-5 shrink-0 overflow-hidden border border-zinc-100 shadow-sm transition-transform hover:scale-105">
                            {driverInfo?.foto_url ? (
                                <img src={driverInfo.foto_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User size={32} className="text-zinc-300" />
                            )}
                        </div>

                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-zinc-900 leading-tight mb-1">
                                {driverInfo?.nome_completo || 'Motorista'}
                            </h3>
                            <div className="inline-flex items-center bg-[#eef2ff] text-[#3b82f6] text-[10px] font-black tracking-wider px-3 py-1 rounded-lg uppercase">
                                Especialista
                            </div>
                        </div>

                        <a
                            href={`tel:${driverInfo?.telefone}`}
                            className="w-[56px] h-[56px] bg-[#eff6ff] text-[#3b82f6] rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm shrink-0 border border-[#dbeafe]"
                        >
                            <Phone size={24} fill="currentColor" />
                        </a>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-[#f9fafb] flex items-center p-5 rounded-[28px] border border-zinc-100/80 shadow-sm transition-all hover:bg-white hover:border-zinc-200">
                            <div className="w-11 h-11 bg-white shadow-sm border border-zinc-50 rounded-full flex items-center justify-center mr-4 shrink-0">
                                <Truck size={20} className="text-zinc-900" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Veículo</p>
                                <p className="text-[15px] font-black text-zinc-900 truncate">
                                    {driverInfo?.vehicle?.marca_modelo || driverInfo?.vehicle?.tipo || 'Socorro'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#f9fafb] flex items-center p-5 rounded-[28px] border border-zinc-100/80 shadow-sm transition-all hover:bg-white hover:border-zinc-200">
                            <div className="w-11 h-11 bg-white shadow-sm border border-zinc-50 rounded-full flex items-center justify-center mr-4 shrink-0">
                                <Tag size={20} className="text-zinc-900" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Placa</p>
                                <p className="text-[15px] font-black text-zinc-900 uppercase tracking-wider">
                                    {driverInfo?.vehicle?.placa || '---'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex gap-4 h-[64px]">
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="flex-[2] bg-[#111822] text-white font-black rounded-[24px] flex justify-center items-center text-[16px] hover:bg-black active:scale-[0.98] transition-all gap-3 shadow-lg shadow-zinc-200"
                        >
                            <MessageSquare size={20} fill="currentColor" />
                            Mensagem
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-[#f3f4f6] text-zinc-500 font-black rounded-[24px] flex justify-center items-center text-[15px] hover:bg-zinc-200 active:scale-[0.98] transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Overlay */}
            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                corridaId={rideId}
                isActive={true}
                otherPartyName={driverInfo?.nome_completo}
            />
        </div>
    );
}

