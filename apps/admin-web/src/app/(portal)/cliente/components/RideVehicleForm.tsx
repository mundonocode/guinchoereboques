'use client';

import React from 'react';
import { Car, AlertTriangle } from 'lucide-react';

interface RideVehicleFormProps {
    placa: string;
    setPlaca: (v: string) => void;
    cor: string;
    setCor: (v: string) => void;
    marcaModelo: string;
    setMarcaModelo: (v: string) => void;
    problemaDescricao: string;
    setProblemaDescricao: (v: string) => void;
    problemaTipo: string;
    setProblemaTipo: (v: string) => void;
    problemTypes: string[];
    isFormValid: boolean;
    onConfirm: () => void;
}

export function RideVehicleForm({
    placa,
    setPlaca,
    cor,
    setCor,
    marcaModelo,
    setMarcaModelo,
    problemaDescricao,
    setProblemaDescricao,
    problemaTipo,
    setProblemaTipo,
    problemTypes,
    isFormValid,
    onConfirm
}: RideVehicleFormProps) {

    // Auto-formata a placa para AAA-1234
    const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (val.length > 3) {
            val = val.substring(0, 3) + '-' + val.substring(3, 7);
        }
        setPlaca(val);
    };

    return (
        <div className="relative w-full h-full bg-white">
            {/* Scrollable Content Area */}
            <div className="absolute top-0 left-0 right-0 bottom-[100px] overflow-y-auto px-5 md:px-6 pt-2 pb-6 no-scrollbar">
                <div className="flex gap-4 mb-5">
                    <div className="flex-1">
                        <label className="block text-[11px] font-bold text-gray-500 mb-1.5 tracking-wider">PLACA</label>
                        <input
                            type="text"
                            value={placa}
                            onChange={handlePlacaChange}
                            placeholder="ABC-1234"
                            maxLength={8}
                            className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3.5 text-[15px] font-semibold outline-none focus:border-black focus:bg-white transition-all uppercase placeholder-gray-300"
                        />
                    </div>
                    <div className="flex-[0.8]">
                        <label className="block text-[11px] font-bold text-gray-500 mb-1.5 tracking-wider">COR</label>
                        <input
                            type="text"
                            value={cor}
                            onChange={(e) => setCor(e.target.value)}
                            placeholder="Prata"
                            className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3.5 text-[15px] font-semibold outline-none focus:border-black focus:bg-white transition-all placeholder-gray-300"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 tracking-wider">MARCA E MODELO</label>
                    <input
                        type="text"
                        value={marcaModelo}
                        onChange={(e) => setMarcaModelo(e.target.value)}
                        placeholder="Ex: Toyota Corolla"
                        className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3.5 text-[15px] font-semibold outline-none focus:border-black focus:bg-white transition-all placeholder-gray-300"
                    />
                </div>

                <div className="h-px bg-gray-100 mb-6" />

                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={16} className="text-amber-500" />
                    <label className="block text-[12px] font-bold text-gray-900 tracking-wide">O QUE ACONTECEU?</label>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-5">
                    {problemTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setProblemaTipo(type)}
                            className={`py-3 px-2 rounded-xl text-center text-[13px] font-bold transition-all ${problemaTipo === type
                                ? 'bg-black text-white shadow-md scale-[1.02]'
                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="mb-8">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 tracking-wider">DETALHES ADICIONAIS (Opcional)</label>
                    <textarea
                        value={problemaDescricao}
                        onChange={(e) => setProblemaDescricao(e.target.value)}
                        placeholder="Alguma restrição de altura? O pneu está travado?"
                        className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3.5 text-[14px] min-h-[100px] outline-none focus:border-black focus:bg-white transition-all resize-none placeholder-gray-300"
                    />
                </div>
            </div>

            {/* Absolute Sticky Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 bg-white border-t border-gray-100 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10">
                <button
                    onClick={onConfirm}
                    disabled={!isFormValid}
                    className={`w-full py-4 rounded-[14px] font-bold text-[16px] transition-all flex items-center justify-center gap-2 ${!isFormValid
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-black text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:scale-[1.02] active:scale-95'
                        }`}
                >
                    Avançar para Pagamento
                </button>
            </div>
        </div>
    );
}
