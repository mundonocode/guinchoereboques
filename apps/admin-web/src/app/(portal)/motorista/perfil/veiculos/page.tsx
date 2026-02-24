'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Truck, Plus, CheckCircle, Trash2 } from 'lucide-react';

interface Veiculo {
    id: string;
    placa: string;
    tipo: string;
    marca_modelo: string | null;
    ano: number | null;
    status: string | null;
}

export default function MotoristaVehiclesPage() {
    const router = useRouter();
    const { session } = useAuth();
    const supabase = createClient();

    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
    const [loadingInit, setLoadingInit] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form state
    const [isAdding, setIsAdding] = useState(false);
    const [placa, setPlaca] = useState('');
    const [tipo, setTipo] = useState('');
    const [marcaModelo, setMarcaModelo] = useState('');
    const [ano, setAno] = useState('');

    useEffect(() => {
        fetchVeiculos();
    }, [session]);

    const fetchVeiculos = async () => {
        if (!session?.user?.id) return;
        try {
            const { data, error } = await supabase
                .from('veiculos_guincho')
                .select('*')
                .eq('perfil_id', session.user.id);

            if (error) throw error;
            setVeiculos(data || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            alert('Erro: Não foi possível carregar seus veículos.');
        } finally {
            setLoadingInit(false);
        }
    };

    const handleMarkActive = async (vehicleId: string) => {
        setIsProcessing(true);
        try {
            // First mark all vehicles of this user as inativo
            await supabase
                .from('veiculos_guincho')
                .update({ status: 'inativo' })
                .eq('perfil_id', session?.user?.id);

            // Then mark the chosen one as ativo
            const { error } = await supabase
                .from('veiculos_guincho')
                .update({ status: 'ativo' })
                .eq('id', vehicleId);

            if (error) throw error;

            // Optimistic UI update
            setVeiculos(veiculos.map(v => ({
                ...v,
                status: v.id === vehicleId ? 'ativo' : 'inativo'
            })));
        } catch (error) {
            console.error('Error setting vehicle active:', error);
            alert('Falha ao definir como caminhão ativo. Tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (vehicleId: string, isActive: boolean) => {
        if (veiculos.length === 1) {
            alert('Atenção: Você não pode excluir seu único veículo.');
            return;
        }

        if (!confirm('Tem certeza que deseja apagar este caminhão permanentemente?')) return;

        setIsProcessing(true);
        try {
            const { error } = await supabase
                .from('veiculos_guincho')
                .delete()
                .eq('id', vehicleId);

            if (error) throw error;

            const newList = veiculos.filter(v => v.id !== vehicleId);
            setVeiculos(newList);

            // If we deleted the active one, optionally set the first remaining as active
            if (isActive && newList.length > 0) {
                await handleMarkActive(newList[0].id);
            }
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            alert('Não foi possível remover o veículo.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddVehicle = async () => {
        if (!placa || !tipo) {
            alert('Placa e Tipo do guincho são obrigatórios.');
            return;
        }

        setIsProcessing(true);
        try {
            const { data, error } = await supabase
                .from('veiculos_guincho')
                .insert([{
                    perfil_id: session?.user?.id,
                    placa,
                    tipo,
                    marca_modelo: marcaModelo || null,
                    ano: ano ? parseInt(ano) : null,
                    status: 'inativo' // starts isolated
                }])
                .select()
                .single();

            if (error) throw error;

            setVeiculos([...veiculos, data]);

            // Clean form
            setPlaca('');
            setTipo('');
            setMarcaModelo('');
            setAno('');
            setIsAdding(false);
        } catch (error) {
            console.error('Error saving new vehicle:', error);
            alert('Não foi possível salvar o veículo.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loadingInit) {
        return (
            <div className="flex-1 flex flex-col h-[100dvh] bg-gray-50">
                <div className="flex items-center px-5 pt-[72px] pb-4 bg-white border-b border-gray-100">
                    <button onClick={() => router.push('/motorista/perfil')} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                        <ArrowLeft size={24} className="text-gray-900" />
                    </button>
                    <h1 className="text-[18px] font-bold text-gray-900 ml-2">Meus Veículos</h1>
                </div>
                <div className="flex-1 flex justify-center items-center pb-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-[72px] pb-4 bg-white border-b border-gray-100 sticky top-0 z-10 transition-colors">
                <div className="flex items-center">
                    <button
                        onClick={() => router.push('/motorista/perfil')}
                        className="p-2 -ml-2 rounded-full active:bg-gray-100"
                        disabled={isProcessing}
                    >
                        <ArrowLeft size={24} className="text-gray-900" />
                    </button>
                    <h1 className="text-[18px] font-bold text-gray-900 ml-2">Meus Veículos</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pb-24">
                {veiculos.map((v) => {
                    const isAtivo = v.status === 'ativo';
                    return (
                        <div
                            key={v.id}
                            className={`bg-white rounded-2xl p-4 mb-4 border transition-all ${isAtivo ? 'border-gray-900 shadow-md' : 'border-gray-200 shadow-sm'}`}
                        >
                            <div className="flex items-center">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shrink-0 transition-colors ${isAtivo ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <Truck size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[18px] font-bold text-gray-900 uppercase">{v.placa}</h3>
                                    <p className="text-[14px] font-medium text-gray-500 mt-0.5">{v.tipo}</p>
                                    {(v.marca_modelo || v.ano) && (
                                        <p className="text-[12px] text-gray-400 mt-1">
                                            {v.marca_modelo} {v.ano ? `• ${v.ano}` : ''}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center justify-center">
                                    <button
                                        onClick={() => handleDelete(v.id, isAtivo)}
                                        disabled={isProcessing}
                                        className="p-2 bg-red-50 rounded-lg active:scale-95 transition-transform"
                                    >
                                        <Trash2 size={20} className="text-red-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="h-[1px] bg-gray-100 my-4" />

                            {isAtivo ? (
                                <div className="flex items-center justify-center bg-green-50 py-2.5 rounded-lg border border-green-100/50">
                                    <CheckCircle size={16} className="text-green-600" />
                                    <span className="text-[14px] font-semibold text-green-700 ml-2 tracking-tight">Veículo Ativo e em uso hoje</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleMarkActive(v.id)}
                                    disabled={isProcessing}
                                    className="w-full bg-gray-50 py-2.5 rounded-lg flex items-center justify-center active:bg-gray-100 transition-colors border border-gray-100"
                                >
                                    <span className="text-[14px] font-semibold text-gray-600 tracking-tight">Marcar como ativo agora</span>
                                </button>
                            )}
                        </div>
                    );
                })}

                {isAdding ? (
                    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-200 mt-2 mb-6">
                        <h2 className="text-[18px] font-bold text-gray-900 mb-5">Cadastrar Novo Caminhão</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Placa *</label>
                                <input
                                    type="text"
                                    placeholder="ABC-1234"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[15px] font-medium rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none py-3.5 px-4 transition-all uppercase"
                                    maxLength={7}
                                    value={placa}
                                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                                />
                            </div>

                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Tipo de Guincho *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Plataforma Prancha"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[15px] font-medium rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none py-3.5 px-4 transition-all"
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Marca / Modelo</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Ford Cargo 815"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[15px] font-medium rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none py-3.5 px-4 transition-all"
                                    value={marcaModelo}
                                    onChange={(e) => setMarcaModelo(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Ano</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Ex: 2015"
                                    maxLength={4}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[15px] font-medium rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none py-3.5 px-4 transition-all"
                                    value={ano}
                                    onChange={(e) => setAno(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsAdding(false)}
                                disabled={isProcessing}
                                className="flex-1 bg-white border-2 border-gray-100 text-gray-600 font-bold py-3.5 rounded-xl active:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddVehicle}
                                disabled={isProcessing}
                                className="flex-[2] bg-gray-900 text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center shadow-md shadow-gray-900/10"
                            >
                                {isProcessing ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    'Salvar Veículo'
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full h-14 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 mt-2 active:bg-gray-50 transition-colors"
                    >
                        <Plus size={20} className="text-gray-900" />
                        <span className="text-[15px] font-bold text-gray-900">Adicionar Caminhão</span>
                    </button>
                )}
            </div>
        </div>
    );
}
