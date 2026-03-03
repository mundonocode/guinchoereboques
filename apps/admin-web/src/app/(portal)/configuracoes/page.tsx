'use client';

import React, { useEffect, useState } from 'react';
import { Save, Bell, Shield, Sliders } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ConfiguraçõesPage() {
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [configId, setConfigId] = useState<string | null>(null);
    const [config, setConfig] = useState({
        split_percentage: 15.00,
        asaas_api_key: '',
        google_maps_api_key: '',
        raio_busca: 15,
        tempo_aceite: 30
    });

    useEffect(() => {
        console.log("ConfiguraçõesPage: Iniciando busca de configurações...");

        // Safety timeout to prevent permanent loading state
        const timeout = setTimeout(() => {
            console.warn("ConfiguraçõesPage: Timeout na busca de configurações. Forçando encerramento do loading.");
            setIsLoading(false);
        }, 5000);

        async function fetchConfig() {
            try {
                console.log("ConfiguraçõesPage: Chamando Supabase...");
                const { data, error } = await supabase
                    .from('configuracoes')
                    .select('*')
                    .limit(1)
                    .single();

                if (error) {
                    console.error("ConfiguraçõesPage: Erro do Supabase:", error);
                }

                if (data) {
                    console.log("ConfiguraçõesPage: Dados recebidos:", data);
                    setConfigId(data.id);
                    setConfig(prev => ({
                        ...prev,
                        split_percentage: data.split_percentage || 15.00,
                        asaas_api_key: data.asaas_api_key || '',
                    }));
                } else {
                    console.log("ConfiguraçõesPage: Nenhum dado encontrado.");
                }
            } catch (err) {
                console.error("ConfiguraçõesPage: Exceção na busca:", err);
            } finally {
                clearTimeout(timeout);
                console.log("ConfiguraçõesPage: Finalizando loading.");
                setIsLoading(false);
            }
        }
        fetchConfig();

        return () => clearTimeout(timeout);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: name === 'split_percentage' || name === 'raio_busca' || name === 'tempo_aceite' ? Number(value) : value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (configId) {
                await supabase
                    .from('configuracoes')
                    .update({
                        split_percentage: config.split_percentage,
                        asaas_api_key: config.asaas_api_key,
                    })
                    .eq('id', configId);
            } else {
                const { data } = await supabase
                    .from('configuracoes')
                    .insert([{
                        split_percentage: config.split_percentage,
                        asaas_api_key: config.asaas_api_key,
                    }])
                    .select()
                    .single();

                if (data) setConfigId(data.id);
            }
            alert("Configurações salvas com sucesso!");
        } catch (error) {
            console.error("Error saving configs:", error);
            alert("Erro ao salvar configurações.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-10">Carregando configurações...</div>;
    }

    return (
        <div className="p-10 space-y-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-muted hover:text-black transition-colors">
                        <Bell size={24} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gray-200 border border-border overflow-hidden">
                        <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl space-y-10">
                <div className="bg-card rounded-[2rem] border border-border shadow-soft p-10">
                    <div className="flex items-center gap-3 mb-10">
                        <Sliders size={20} className="text-black" />
                        <h2 className="text-xl font-bold">Configurações Gerais</h2>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-1">Taxa da Plataforma (%)</h4>
                                <p className="text-[11px] text-muted font-medium">Porcentagem retida de cada corrida via Asaas Split</p>
                            </div>
                            <input
                                type="number"
                                name="split_percentage"
                                value={config.split_percentage}
                                onChange={handleChange}
                                className="w-20 p-3 bg-gray-50 border border-border rounded-xl text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-1">Raio de Busca (km)</h4>
                                <p className="text-[11px] text-muted font-medium">Distância máxima para alerta de motorista</p>
                            </div>
                            <input
                                type="number"
                                name="raio_busca"
                                value={config.raio_busca}
                                onChange={handleChange}
                                className="w-20 p-3 bg-gray-50 border border-border rounded-xl text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-1">Tempo de Aceite (segundos)</h4>
                                <p className="text-[11px] text-muted font-medium">Tempo para o motorista aceitar a chamada</p>
                            </div>
                            <input
                                type="number"
                                name="tempo_aceite"
                                value={config.tempo_aceite}
                                onChange={handleChange}
                                className="w-20 p-3 bg-gray-50 border border-border rounded-xl text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-[2rem] border border-border shadow-soft p-10">
                    <div className="flex items-center gap-3 mb-10">
                        <Shield size={20} className="text-black" />
                        <h2 className="text-xl font-bold">Segurança e API</h2>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest">ASAAS API KEY</label>
                            <input
                                type="password"
                                name="asaas_api_key"
                                value={config.asaas_api_key}
                                onChange={handleChange}
                                placeholder="Insira a chave de API do Asaas"
                                className="w-full p-4 bg-gray-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest">GOOGLE MAPS API KEY</label>
                            <input
                                type="password"
                                name="google_maps_api_key"
                                value={config.google_maps_api_key}
                                onChange={handleChange}
                                placeholder="Insira a chave do Google Maps"
                                className="w-full p-4 bg-gray-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
