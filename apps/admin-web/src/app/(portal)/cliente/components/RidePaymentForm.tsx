'use client';

import React from 'react';
import { CreditCard, Banknote, Clock } from 'lucide-react';

interface RidePaymentFormProps {
    paymentMethod: 'credit_card' | 'pix';
    setPaymentMethod: (m: 'credit_card' | 'pix') => void;
    ccNumber: string;
    setCcNumber: (v: string) => void;
    ccName: string;
    setCcName: (v: string) => void;
    ccExpiry: string;
    setCcExpiry: (v: string) => void;
    ccCvv: string;
    setCcCvv: (v: string) => void;
    estimatedPrice: number;
    distanceKm: number;
    onConfirm: () => void;
}

export function RidePaymentForm({
    paymentMethod,
    setPaymentMethod,
    ccNumber,
    setCcNumber,
    ccName,
    setCcName,
    ccExpiry,
    setCcExpiry,
    ccCvv,
    setCcCvv,
    estimatedPrice,
    distanceKm,
    onConfirm
}: RidePaymentFormProps) {
    return (
        <div className="relative w-full h-full bg-white">
            {/* Scrollable Content Area */}
            <div className="absolute inset-0 bottom-[100px] overflow-y-auto px-5 md:px-6 pt-2 no-scrollbar">

                {/* Visual Premium Card */}
                <div className="bg-gray-900 rounded-3xl p-6 mb-8 shadow-[0_12px_24px_rgba(0,0,0,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-xl -ml-8 -mb-8" />

                    <div className="relative z-10">
                        <p className="text-gray-400 font-medium text-[13px] tracking-wider mb-2">VALOR ESTIMADO</p>
                        <div className="flex items-end gap-2">
                            <span className="text-white text-2xl font-normal opacity-80 mb-1">R$</span>
                            <span className="text-white text-4xl font-black tracking-tight">{estimatedPrice.toFixed(2).replace('.', ',')}</span>
                        </div>

                        <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between text-sm">
                            <span className="text-gray-400">Distância da Rota</span>
                            <span className="text-white font-semibold">{distanceKm.toFixed(1)} km</span>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-[14px] font-bold text-gray-900 tracking-wide mb-4 flex items-center gap-2">
                        <CreditCard size={18} className="text-gray-400" />
                        MÉTODO DE PAGAMENTO
                    </h3>
                </div>

                {/* PIX Option */}
                <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left mb-3 ${paymentMethod === 'pix'
                        ? 'border-gray-900 bg-gray-50/50 shadow-sm'
                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                        }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'pix' ? 'bg-[#32BCAD] text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16.142 2l5.314 5.314c.725.725.725 1.901 0 2.626l-5.314 5.314c-.725.725-1.901.725-2.626 0l-5.314-5.314c-.725-.725-.725-1.901 0-2.626L13.516 2c.725-.725 1.901-.725 2.626 0zM7.858 22l-5.314-5.314c-.725-.725-.725-1.901 0-2.626l5.314-5.314c.725-.725 1.901-.725 2.626 0l5.314 5.314c.725.725.725 1.901 0 2.626L10.484 22c-.725.725-1.901.725-2.626 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className={`text-[15px] font-bold mb-0.5 ${paymentMethod === 'pix' ? 'text-gray-900' : 'text-gray-600'}`}>Pix Direto</p>
                            <p className="text-[12px] text-[#32BCAD] font-semibold">Desconto automático</p>
                        </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-[2.5px] flex items-center justify-center transition-colors ${paymentMethod === 'pix' ? 'border-gray-900' : 'border-gray-300'}`}>
                        {paymentMethod === 'pix' && <div className="w-3 h-3 rounded-full bg-gray-900" />}
                    </div>
                </button>

                {/* Credit Card Option */}
                <button
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${paymentMethod === 'credit_card'
                        ? 'border-gray-900 bg-gray-50/50 shadow-sm'
                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                        }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'credit_card' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className={`text-[15px] font-bold mb-0.5 ${paymentMethod === 'credit_card' ? 'text-gray-900' : 'text-gray-600'}`}>Cartão de Crédito</p>
                            <p className="text-[12px] text-gray-400 font-medium">Pague no fim da corrida</p>
                        </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-[2.5px] flex items-center justify-center transition-colors ${paymentMethod === 'credit_card' ? 'border-gray-900' : 'border-gray-300'}`}>
                        {paymentMethod === 'credit_card' && <div className="w-3 h-3 rounded-full bg-gray-900" />}
                    </div>
                </button>

                {paymentMethod === 'credit_card' && (
                    <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 mt-2 text-center">
                        <p className="text-[13px] font-medium text-gray-500">
                            A maquininha será levada pelo motorista até o local do resgate.
                        </p>
                    </div>
                )}
            </div>

            {/* Absolute Sticky Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 bg-white border-t border-gray-100 z-10 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                <button
                    onClick={onConfirm}
                    className="w-full bg-gray-900 text-white py-4 rounded-[14px] font-bold text-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center"
                >
                    Confirmar Solicitação
                </button>
            </div>
        </div>
    );
}
