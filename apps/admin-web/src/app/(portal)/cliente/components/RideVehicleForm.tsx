'use client';

import React, { useState } from 'react';
import { Car, AlertTriangle, ArrowLeft } from 'lucide-react';

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
    localRemocao: string;
    setLocalRemocao: (v: string) => void;
    problemTypes: string[];
    isFormValid: boolean;
    onConfirm: () => void;
}

const locationTypes = [
    'Via Pública',
    'Garagem Subsolo',
    'Garagem Nível da Rua',
    'Ribanceira / Fora da Via'
];

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
    localRemocao,
    setLocalRemocao,
    problemTypes,
    isFormValid,
    onConfirm
}: RideVehicleFormProps) {
    const [step, setStep] = useState(1);

    const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (val.length > 3) {
            val = val.substring(0, 3) + '-' + val.substring(3, 7);
        }
        setPlaca(val);
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="relative w-full h-full bg-white flex flex-col">
            {step > 1 && (
                <button
                    onClick={prevStep}
                    className="absolute top-2 left-4 z-20 p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
            )}

            <div className="absolute top-0 left-0 right-0 bottom-[100px] overflow-y-auto px-5 md:px-6 pt-12 pb-6 no-scrollbar">

                {/* Step 1: Problema */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-[18px] font-black text-gray-900 mb-6 text-center">O que houve com o veículo?</h3>
                        <div className="flex flex-col gap-3">
                            {problemTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setProblemaTipo(type)}
                                    className={`py-4 px-4 rounded-2xl text-[15px] font-bold transition-all ${problemaTipo === type
                                            ? 'bg-black text-white shadow-md border-2 border-black scale-[1.02]'
                                            : 'bg-white text-gray-700 border-2 border-gray-100 hover:border-gray-300'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Local */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-[18px] font-black text-gray-900 mb-6 text-center">Como é o Local da Remoção?</h3>
                        <div className="flex flex-col gap-3">
                            {locationTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setLocalRemocao(type)}
                                    className={`py-4 px-4 rounded-2xl text-[15px] font-bold transition-all ${localRemocao === type
                                            ? 'bg-black text-white shadow-md border-2 border-black scale-[1.02]'
                                            : 'bg-white text-gray-700 border-2 border-gray-100 hover:border-gray-300'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Veículo e Descrição */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-[18px] font-black text-gray-900 mb-6 text-center">Detalhes do Veículo</h3>

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

                        <div className="mb-8">
                            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 tracking-wider">DETALHES ADICIONAIS DA SITUAÇÃO (Opcional)</label>
                            <textarea
                                value={problemaDescricao}
                                onChange={(e) => setProblemaDescricao(e.target.value)}
                                placeholder="Alguma restrição de altura? O pneu está travado?"
                                className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3.5 text-[14px] min-h-[100px] outline-none focus:border-black focus:bg-white transition-all resize-none placeholder-gray-300"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Absolute Sticky Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 bg-white border-t border-gray-100 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10">
                {step === 1 && (
                    <button
                        onClick={nextStep}
                        disabled={!problemaTipo}
                        className={`w-full py-4 rounded-[14px] font-bold text-[16px] transition-all flex items-center justify-center gap-2 ${!problemaTipo
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-black text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:scale-[1.02] active:scale-95'
                            }`}
                    >
                        Continuar
                    </button>
                )}
                {step === 2 && (
                    <button
                        onClick={nextStep}
                        disabled={!localRemocao}
                        className={`w-full py-4 rounded-[14px] font-bold text-[16px] transition-all flex items-center justify-center gap-2 ${!localRemocao
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-black text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:scale-[1.02] active:scale-95'
                            }`}
                    >
                        Continuar
                    </button>
                )}
                {step === 3 && (
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
                )}
            </div>
        </div>
    );
}
