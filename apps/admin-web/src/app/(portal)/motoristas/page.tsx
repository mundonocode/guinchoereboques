'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Search, Plus, Star, Settings, Bell, Upload, AlertCircle, CheckCircle2, Building2, User } from 'lucide-react';
import * as XLSX from 'xlsx';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabase';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function MotoristasPage() {
    const [activeTab, setActiveTab] = useState<'autonomos' | 'empresas'>('autonomos');
    const [motoristas, setMotoristas] = useState<any[]>([]);
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ successful: number, failed: number, errors: any[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'autonomos') {
                const { data, error } = await supabase
                    .from('perfis')
                    .select(`
                        id,
                        nome_completo,
                        foto_url,
                        veiculos_guincho (
                            marca_modelo,
                            placa,
                            status,
                            documento_url
                        )
                    `)
                    .eq('role', 'motorista')
                    .is('empresa_id', null);

                if (error) throw error;

                setMotoristas(data.map(m => ({
                    id: m.id,
                    name: m.nome_completo,
                    vehicle: m.veiculos_guincho ? `${(m.veiculos_guincho as any).marca_modelo} (${(m.veiculos_guincho as any).placa})` : 'Sem Veículo',
                    doc: (m.veiculos_guincho as any)?.documento_url ? 'Aprovado' : 'Pendente',
                    rating: 5.0, // Placeholder
                    status: (m.veiculos_guincho as any)?.status || 'Offline',
                    avatar: m.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nome_completo)}&background=random`
                })));
            } else {
                const { data, error } = await (supabase
                    .from('empresas' as any)
                    .select(`
                        id,
                        razao_social,
                        nome_fantasia,
                        cnpj,
                        perfis ( count )
                    `) as any);

                if (error) throw error;

                setEmpresas(data.map((e: any) => ({
                    id: e.id,
                    name: e.nome_fantasia || e.razao_social,
                    cnpj: e.cnpj,
                    vinculados: (e.perfis as any)?.[0]?.count || 0,
                    status: 'Ativa'
                })));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadResult(null);

        try {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                try {
                    const data = new Uint8Array(evt.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    if (!jsonData || jsonData.length === 0) {
                        alert("Planilha vazia ou formato inválido.");
                        setUploading(false);
                        return;
                    }

                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error("Não autenticado");

                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                    const res = await fetch(`${supabaseUrl}/functions/v1/create-users-batch`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({ users: jsonData })
                    });

                    const result = await res.json();
                    setUploadResult(result);

                    if (res.ok && result.successful > 0) {
                        await fetchData();
                    }
                } catch (error: any) {
                    console.error("Erro no processamento da planilha:", error);
                    alert("Erro ao processar planilha: " + error.message);
                } finally {
                    setUploading(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                }
            };
            reader.onerror = () => {
                alert("Erro ao ler o arquivo.");
                setUploading(false);
            };
            reader.readAsArrayBuffer(file);
        } catch (err: any) {
            console.error("Erro no upload", err);
            setUploading(false);
        }
    };

    return (
        <div className="p-10 space-y-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Guincheiros e Frota</h1>
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

            <div className="bg-card rounded-xl border border-border shadow-soft p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div>
                        <h2 className="text-xl font-bold">Gestão de Parceiros</h2>
                        <p className="text-sm text-muted mt-1">Gerencie guincheiros autônomos e transportadoras parceiras.</p>
                    </div>

                    <div className="flex gap-4 items-center w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="text"
                                placeholder={`Buscar ${activeTab === 'autonomos' ? 'guincheiro' : 'empresa'}...`}
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all w-64"
                            />
                        </div>
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="bg-white border border-border text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors shrink-0 disabled:opacity-50"
                        >
                            <Upload size={18} />
                            <span className="hidden sm:inline">{uploading ? 'Importando...' : 'Importar Lote'}</span>
                        </button>
                        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-colors shrink-0">
                            <Plus size={18} />
                            <span className="hidden sm:inline">Adicionar Novo</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-6 border-b border-border mb-6">
                    <button
                        onClick={() => setActiveTab('autonomos')}
                        className={cn(
                            "pb-4 text-sm font-bold transition-colors relative flex items-center gap-2",
                            activeTab === 'autonomos' ? "text-black" : "text-muted hover:text-black"
                        )}
                    >
                        <User size={18} />
                        Autônomos
                        {activeTab === 'autonomos' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('empresas')}
                        className={cn(
                            "pb-4 text-sm font-bold transition-colors relative flex items-center gap-2",
                            activeTab === 'empresas' ? "text-black" : "text-muted hover:text-black"
                        )}
                    >
                        <Building2 size={18} />
                        Empresas (Frotas)
                        {activeTab === 'empresas' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full" />
                        )}
                    </button>
                </div>

                {uploadResult && (
                    <div className={cn(
                        "mb-6 p-4 rounded-lg flex items-start gap-3 border",
                        uploadResult.failed > 0 && uploadResult.successful === 0 ? "bg-red-50 border-red-200" :
                            uploadResult.failed > 0 ? "bg-amber-50 border-amber-200" :
                                "bg-emerald-50 border-emerald-200"
                    )}>
                        {uploadResult.failed > 0 ? <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} /> : <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />}
                        <div>
                            <h3 className="font-bold text-sm text-gray-900">Resultado da Importação</h3>
                            <p className="text-sm text-gray-700 mt-1">
                                {uploadResult.successful} usuário(s) criados com sucesso.
                                {uploadResult.failed > 0 && ` ${uploadResult.failed} falhas encontradas.`}
                            </p>
                            {uploadResult.errors?.length > 0 && (
                                <ul className="mt-2 text-xs text-red-600 list-disc list-inside space-y-1">
                                    {uploadResult.errors.slice(0, 5).map((err, i) => (
                                        <li key={i}>{err.email}: {err.message}</li>
                                    ))}
                                    {uploadResult.errors.length > 5 && (
                                        <li>...e mais {uploadResult.errors.length - 5} erros ocultos.</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-10 text-center text-muted text-sm font-medium">Carregando dados...</div>
                    ) : activeTab === 'autonomos' ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border">
                                    <th className="pb-4">GUINCHEIRO</th>
                                    <th className="pb-4">VEÍCULO</th>
                                    <th className="pb-4">DOCUMENTAÇÃO</th>
                                    <th className="pb-4 text-center">AVALIAÇÃO</th>
                                    <th className="pb-4">STATUS</th>
                                    <th className="pb-4 text-right">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {motoristas.map((driver, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-6">
                                            <div className="flex items-center gap-3">
                                                <img src={driver.avatar} className="w-10 h-10 rounded-full border border-border" alt={driver.name} />
                                                <span className="text-sm font-bold text-gray-900">{driver.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 text-sm font-medium text-muted">{driver.vehicle}</td>
                                        <td className="py-6">
                                            <span className={cn(
                                                "text-[10px] font-bold px-3 py-1 rounded-full",
                                                driver.doc === 'Aprovado' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                            )}>
                                                {driver.doc}
                                            </span>
                                        </td>
                                        <td className="py-6">
                                            <div className="flex items-center justify-center gap-1">
                                                <Star size={14} className="fill-amber-400 text-amber-400" />
                                                <span className="text-sm font-bold">{driver.rating.toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", driver.status === 'Online' ? "bg-emerald-500" : "bg-gray-400")} />
                                                <span className="text-sm font-medium text-muted">{driver.status}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 text-right">
                                            <button className="p-2 text-muted hover:text-black transition-colors rounded-lg hover:bg-gray-100">
                                                <Settings size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {motoristas.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-sm text-muted">Nenhum guincheiro autônomo encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border">
                                    <th className="pb-4">NOME FANTASIA / RAZÃO SOCIAL</th>
                                    <th className="pb-4">CNPJ</th>
                                    <th className="pb-4 text-center">MOTORISTAS VINCULADOS</th>
                                    <th className="pb-4">STATUS DA EMPRESA</th>
                                    <th className="pb-4 text-right">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {empresas.map((empresa, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 border border-border flex items-center justify-center text-gray-500">
                                                    <Building2 size={20} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{empresa.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 text-sm font-medium text-muted">{empresa.cnpj || 'Não informado'}</td>
                                        <td className="py-6 text-center">
                                            <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full">{empresa.vinculados} veíc.</span>
                                        </td>
                                        <td className="py-6">
                                            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600">
                                                {empresa.status}
                                            </span>
                                        </td>
                                        <td className="py-6 text-right">
                                            <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                                Ver Frota
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {empresas.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-sm text-muted">Nenhuma empresa parceira cadastrada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
