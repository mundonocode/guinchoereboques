'use client';

import React, { useState } from 'react';
import { Copy, Check, Info, Clock } from 'lucide-react';

interface RidePixDisplayProps {
    pixData: {
        encodedImage: string;
        payload: string;
        expirationDate: string;
    };
    onClose: () => void;
}

export function RidePixDisplay({ pixData, onClose }: RidePixDisplayProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(pixData.payload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full flex flex-col items-center p-6 bg-white overflow-y-auto no-scrollbar max-h-[80vh]">
            <div className="w-12 h-12 rounded-2xl bg-[#32BCAD]/10 flex items-center justify-center text-[#32BCAD] mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.142 2l5.314 5.314c.725.725.725 1.901 0 2.626l-5.314 5.314c-.725.725-1.901.725-2.626 0l-5.314-5.314c-.725-.725-.725-1.901 0-2.626L13.516 2c.725-.725 1.901-.725 2.626 0zM7.858 22l-5.314-5.314c-.725-.725-.725-1.901 0-2.626l5.314-5.314c.725-.725 1.901-.725 2.626 0l5.314 5.314c.725.725.725 1.901 0 2.626L10.484 22c-.725.725-1.901.725-2.626 0z" />
                </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Pague com Pix</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
                Escaneie o código QR abaixo para confirmar sua solicitação de guincho.
            </p>

            {/* QR Code */}
            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center justify-center mb-6 shadow-inner">
                <img
                    src={`data:image/png;base64,${pixData.encodedImage}`}
                    alt="Pix QR Code"
                    className="w-48 h-48 rounded-md"
                />
            </div>

            {/* Copy Paste Section */}
            <div className="w-full mb-6">
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">CÓDIGO COPIA E COLA</p>
                <div
                    onClick={handleCopy}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer active:scale-[0.98] transition-all group"
                >
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-gray-600 truncate">{pixData.payload}</p>
                    </div>
                    {copied ? (
                        <Check size={18} className="text-[#32BCAD]" />
                    ) : (
                        <Copy size={18} className="text-gray-400 group-hover:text-gray-600" />
                    )}
                </div>
            </div>

            {/* Info Box */}
            <div className="w-full bg-blue-50/50 p-4 rounded-2xl flex gap-3 mb-8 border border-blue-100/50">
                <div className="text-blue-500 mt-0.5">
                    <Clock size={18} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-blue-900 mb-0.5">Aguardando pagamento</p>
                    <p className="text-[12px] text-blue-700 leading-relaxed">
                        Assim que o pagamento for confirmado, começaremos a procurar um motorista para você.
                    </p>
                </div>
            </div>

            <button
                onClick={onClose}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold text-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
            >
                Entendi
            </button>
        </div>
    );
}
