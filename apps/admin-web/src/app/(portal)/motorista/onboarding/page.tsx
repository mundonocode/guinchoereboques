'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
    User, Mail, Phone, Lock, Briefcase, Truck, Shield,
    CreditCard, Wallet, Camera, CheckCircle, ArrowRight, ArrowLeft,
    UploadCloud, FileCheck, Check, AlertCircle
} from 'lucide-react';

const supabase = createClient();

interface OnboardingData {
    // Step 1: Personal & Vehicle
    nome_completo: string;
    cpf: string;
    telefone: string;
    cnh_com_ear: string;
    placa: string;
    marca_modelo: string;
    tipo_plataforma: string;
    registro_antt: string;

    // Step 2: Payments
    possui_conta_asaas: boolean;
    asaas_wallet_id: string;
    tipo_pessoa: 'PF' | 'PJ';
    recebimento_nome: string;
    recebimento_email: string;
    recebimento_cnpj: string;
    dados_bancarios: string;

    // Step 3: Documents
    cnh_foto_url: string;
    veiculo_foto_url: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingInit, setLoadingInit] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<OnboardingData>({
        nome_completo: '',
        cpf: '',
        telefone: '',
        cnh_com_ear: '',
        placa: '',
        marca_modelo: '',
        tipo_plataforma: '',
        registro_antt: '',
        possui_conta_asaas: false,
        asaas_wallet_id: '',
        tipo_pessoa: 'PF',
        recebimento_nome: '',
        recebimento_email: '',
        recebimento_cnpj: '',
        dados_bancarios: '',
        cnh_foto_url: '',
        veiculo_foto_url: ''
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }
                setUserId(user.id);

                const { data: perfil, error: perfilError } = await supabase
                    .from('perfis')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                console.log('Onboarding: Profile load result', { perfil, perfilError });

                if (perfilError && perfilError.code !== 'PGRST116') {
                    console.error('Error loading profile:', perfilError);
                    setError('Erro ao carregar perfil: ' + perfilError.message);
                }

                if (perfil) {
                    setFormData(prev => ({
                        ...prev,
                        nome_completo: perfil.nome_completo || '',
                        cpf: perfil.cpf || '',
                        telefone: perfil.telefone || '',
                        cnh_com_ear: (perfil as any).cnh_com_ear || '',
                        possui_conta_asaas: (perfil as any).possui_conta_asaas || false,
                        asaas_wallet_id: (perfil as any).asaas_wallet_id || '',
                        tipo_pessoa: ((perfil as any).tipo_pessoa as 'PF' | 'PJ') || 'PF',
                        recebimento_nome: (perfil as any).recebimento_nome || perfil.nome_completo || '',
                        recebimento_email: (perfil as any).recebimento_email || user.email || '',
                        recebimento_cnpj: (perfil as any).recebimento_cnpj || '',
                        dados_bancarios: (perfil as any).dados_bancarios || '',
                        cnh_foto_url: (perfil as any).cnh_foto_url || '',
                        veiculo_foto_url: (perfil as any).veiculo_foto_url || ''
                    }));

                    // Also check vehicle
                    const { data: veiculo, error: veiculoError } = await supabase
                        .from('veiculos_guincho')
                        .select('*')
                        .eq('perfil_id', user.id)
                        .maybeSingle();

                    console.log('Onboarding: Vehicle load result', { veiculo, veiculoError });

                    if (veiculoError && veiculoError.code !== 'PGRST116') {
                        console.error('Error loading vehicle:', veiculoError);
                    }

                    if (veiculo) {
                        setFormData(prev => ({
                            ...prev,
                            placa: veiculo.placa || '',
                            marca_modelo: veiculo.marca_modelo || '',
                            tipo_plataforma: (veiculo as any).tipo_plataforma_v2 || '',
                            registro_antt: (veiculo as any).registro_antt || ''
                        }));
                    }
                }
            } catch (err: any) {
                console.error('Initialization error:', err);
                setError('Erro ao carregar página de onboarding. Tente atualizar.');
            } finally {
                setLoadingInit(false);
            }
        }
        loadProfile();
    }, [router]);

    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const translateError = (err: any) => {
        if (!err) return null;

        const message = (err.message || '').toLowerCase();
        const details = (err.details || '').toLowerCase();
        const code = String(err.code || '');
        const searchStr = `${message} ${details}`;

        if (code === '23505' || message.includes('unique constraint') || message.includes('already exists')) {
            if (searchStr.includes('perfis_cpf_key') || searchStr.includes('(cpf)')) return 'Este CPF já está cadastrado em outra conta.';
            if (searchStr.includes('veiculos_guincho_placa_key') || searchStr.includes('(placa)')) return 'Esta placa já está cadastrada para outro veículo.';
            if (searchStr.includes('veiculos_guincho_perfil_id_key')) return 'Você já possui um veículo cadastrado neste perfil.';
            return 'Alguns dos dados informados (CPF ou Placa) já estão em uso.';
        }

        return err.message || 'Ocorreu um erro inesperado. Tente novamente.';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        if (name === 'cpf') {
            val = formatCPF(val as string);
        } else if (name === 'telefone' || name === 'recebimento_cnpj') {
            // Apply similar logic for phone or simplecnpj if needed, 
            // but user only asked for cpf and telefone specifically in the request.
            if (name === 'telefone') val = formatPhone(val as string);
        }

        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const saveStep1 = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            setError(null);
            // Update Perfil
            const { error: profileError } = await supabase.from('perfis').update({
                nome_completo: formData.nome_completo,
                cpf: formData.cpf,
                telefone: formData.telefone,
                cnh_com_ear: formData.cnh_com_ear
            } as any).eq('id', userId);

            if (profileError) throw profileError;

            // Upsert Vehicle
            const { data: existing, error: checkError } = await supabase.from('veiculos_guincho').select('id').eq('perfil_id', userId).maybeSingle();

            if (checkError) {
                console.error('Error checking existing vehicle:', checkError);
            }

            const vehicleData = {
                perfil_id: userId,
                placa: formData.placa.toUpperCase(),
                marca_modelo: formData.marca_modelo,
                tipo_plataforma_v2: formData.tipo_plataforma,
                registro_antt: formData.registro_antt,
                status: 'ativo'
            };

            if (existing) {
                const { error: updateErr } = await supabase.from('veiculos_guincho').update(vehicleData as any).eq('id', existing.id);
                if (updateErr) throw updateErr;
            } else {
                const { error: insertErr } = await supabase.from('veiculos_guincho').insert([{ ...vehicleData, tipo: 'guincho' } as any]);
                if (insertErr) throw insertErr;
            }
            nextStep();
        } catch (err: any) {
            console.error('Error saving step 1:', {
                msg: err.message,
                code: err.code,
                det: err.details,
                keys: Object.keys(err)
            }, err);
            setError(translateError(err));
        } finally {
            setLoading(false);
        }
    };

    const saveStep2 = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            setError(null);
            const { error: profileError } = await supabase.from('perfis').update({
                possui_conta_asaas: formData.possui_conta_asaas,
                asaas_wallet_id: formData.possui_conta_asaas ? formData.asaas_wallet_id : null,
                tipo_pessoa: formData.tipo_pessoa,
                recebimento_nome: formData.recebimento_nome,
                recebimento_email: formData.recebimento_email,
                recebimento_cnpj: formData.tipo_pessoa === 'PJ' ? formData.recebimento_cnpj : null,
                dados_bancarios: formData.dados_bancarios
            } as any).eq('id', userId);

            if (profileError) throw profileError;

            nextStep();
        } catch (err: any) {
            console.error('Error saving step 2:', err.message || err.code || 'Unknown Error', err);
            setError(translateError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cnh_foto_url' | 'veiculo_foto_url') => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        setLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${field}-${Math.random()}.${fileExt}`;
            const filePath = `documentos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('documentos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('documentos')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, [field]: publicUrl }));
        } catch (error: any) {
            console.error('Error uploading file:', error.message || 'Unknown Error', error);
            setError('Erro ao enviar arquivo. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    const finalizeOnboarding = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            setError(null);
            const { error: profileError } = await supabase.from('perfis').update({
                cnh_foto_url: formData.cnh_foto_url,
                veiculo_foto_url: formData.veiculo_foto_url,
                onboarding_completo: true,
                status_verificacao: 'pendente'
            } as any).eq('id', userId);

            if (profileError) throw profileError;

            // Refresh server components to update the layout state (onboarding_completo)
            router.refresh();

            // Redirect to the dashboard
            router.push('/motorista');
        } catch (err: any) {
            console.error('Error finalizing onboarding:', err.message || err.code || 'Unknown Error', err);
            setError(translateError(err));
        } finally {
            setLoading(false);
        }
    };

    if (loadingInit) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header / Stepper Progress */}
            <header className="p-6 md:px-12 flex items-center justify-between border-b border-white/10 sticky top-0 bg-black z-20">
                <div className="flex items-center gap-4">
                    <img src="/logo-oficial.png.png" alt="Logo" className="h-8 w-auto" />
                    <div className="h-4 w-[1px] bg-white/20 mx-2 hidden sm:block"></div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 hidden sm:block">Onboarding Profissional</span>
                </div>

                <div className="flex items-center gap-3">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${currentStep >= s ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-500'
                                }`}>
                                {currentStep > s ? <Check size={16} strokeWidth={3} /> : s}
                            </div>
                            {s < 3 && <div className={`w-6 h-[2px] rounded-full sm:w-12 ${currentStep > s ? 'bg-amber-500' : 'bg-zinc-800'}`}></div>}
                        </div>
                    ))}
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
                <div className="max-w-[480px] w-full space-y-10">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-[13px] text-red-600 font-bold leading-tight">{error}</p>
                        </div>
                    )}

                    {/* STEP 1: PERSONAL & VEHICLE */}
                    {currentStep === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2 text-center lg:text-left">
                                <h2 className="text-[32px] font-bold tracking-tight text-black leading-tight">Dados Profissionais</h2>
                                <p className="text-[15px] text-zinc-500 font-medium">Conte-nos um pouco sobre você e sua ferramenta de trabalho.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                                            <User size={12} /> Nome Completo
                                        </label>
                                        <input
                                            name="nome_completo"
                                            value={formData.nome_completo}
                                            onChange={handleInputChange}
                                            placeholder="Seu nome"
                                            className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 font-medium text-[15px] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                                            <Shield size={12} /> CPF
                                        </label>
                                        <input
                                            name="cpf"
                                            value={formData.cpf}
                                            onChange={handleInputChange}
                                            placeholder="000.000.000-00"
                                            className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 font-medium text-[15px] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                                            <Phone size={12} /> Celular
                                        </label>
                                        <input
                                            name="telefone"
                                            value={formData.telefone}
                                            onChange={handleInputChange}
                                            placeholder="(00) 00000-0000"
                                            className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 font-medium text-[15px] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                                            <Shield size={12} /> CNH com EAR
                                        </label>
                                        <input
                                            name="cnh_com_ear"
                                            value={formData.cnh_com_ear}
                                            onChange={handleInputChange}
                                            placeholder="Número da CNH"
                                            className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 font-medium text-[15px] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-zinc-100 space-y-4">
                                    <h3 className="text-[14px] font-bold text-black uppercase tracking-wider flex items-center gap-2">
                                        <Truck size={16} /> Dados do Veículo
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Placa</label>
                                            <input
                                                name="placa"
                                                value={formData.placa}
                                                onChange={handleInputChange}
                                                placeholder="ABC1D23"
                                                className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 font-medium text-[15px] transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Modelo</label>
                                            <input
                                                name="marca_modelo"
                                                value={formData.marca_modelo}
                                                onChange={handleInputChange}
                                                placeholder="Ex: Ford Cargo"
                                                className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 font-medium text-[15px] transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Plataforma</label>
                                            <select
                                                name="tipo_plataforma"
                                                value={formData.tipo_plataforma}
                                                onChange={handleInputChange}
                                                className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 font-medium text-[15px] transition-all"
                                            >
                                                <option value="">Selecione</option>
                                                <option value="Hidráulica">Hidráulica</option>
                                                <option value="Asa Delta">Asa Delta</option>
                                                <option value="Lança">Lança</option>
                                                <option value="Pesado">Pesado</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400">ANTT / RNTRC</label>
                                            <input
                                                name="registro_antt"
                                                value={formData.registro_antt}
                                                onChange={handleInputChange}
                                                placeholder="Número do registro"
                                                className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 font-medium text-[15px] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={saveStep1}
                                disabled={loading}
                                className="w-full bg-black text-white py-4 px-8 rounded-xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-900 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? 'Salvando...' : 'Continuar'} <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: PAYMENTS */}
                    {currentStep === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2 text-center lg:text-left">
                                <h2 className="text-[32px] font-bold tracking-tight text-black leading-tight">Recebimentos</h2>
                                <p className="text-[15px] text-zinc-500 font-medium">Configure como deseja receber pelos seus serviços.</p>
                            </div>

                            <div className="space-y-6">
                                <label className="flex items-center gap-4 p-5 bg-zinc-50 border border-zinc-200 rounded-2xl cursor-pointer hover:border-black transition-all">
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${formData.possui_conta_asaas ? 'bg-black border-black' : 'border-zinc-300'}`}>
                                        {formData.possui_conta_asaas && <Check size={16} color="white" strokeWidth={4} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[15px] font-bold text-black leading-tight">Já possuo conta Asaas</p>
                                        <p className="text-[13px] text-zinc-500 font-medium italic mt-0.5">Usar Wallet ID existente</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="possui_conta_asaas"
                                        checked={formData.possui_conta_asaas}
                                        onChange={handleInputChange}
                                        className="hidden"
                                    />
                                </label>

                                {formData.possui_conta_asaas ? (
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                                            <Wallet size={12} /> Wallet ID do Asaas
                                        </label>
                                        <input
                                            name="asaas_wallet_id"
                                            value={formData.asaas_wallet_id}
                                            onChange={handleInputChange}
                                            placeholder="Ex: c7891234-..."
                                            className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 font-medium text-[15px] transition-all"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex bg-zinc-100 p-1 rounded-xl">
                                            <button
                                                onClick={() => setFormData(p => ({ ...p, tipo_pessoa: 'PF' }))}
                                                className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${formData.tipo_pessoa === 'PF' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}
                                            >
                                                Pessoa Física
                                            </button>
                                            <button
                                                onClick={() => setFormData(p => ({ ...p, tipo_pessoa: 'PJ' }))}
                                                className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${formData.tipo_pessoa === 'PJ' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}
                                            >
                                                Pessoa Jurídica
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Nome ou Razão Social</label>
                                                <input
                                                    name="recebimento_nome"
                                                    value={formData.recebimento_nome}
                                                    onChange={handleInputChange}
                                                    className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-[15px]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400">E-mail para Cadastro</label>
                                                <input
                                                    name="recebimento_email"
                                                    value={formData.recebimento_email}
                                                    onChange={handleInputChange}
                                                    className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-[15px]"
                                                />
                                            </div>
                                            {formData.tipo_pessoa === 'PJ' && (
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400">CNPJ</label>
                                                    <input
                                                        name="recebimento_cnpj"
                                                        value={formData.recebimento_cnpj}
                                                        onChange={handleInputChange}
                                                        className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-[15px]"
                                                    />
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                                                    Dados Bancários <span className="text-[8px] opacity-60">Banco, Ag, Conta</span>
                                                </label>
                                                <input
                                                    name="dados_bancarios"
                                                    value={formData.dados_bancarios}
                                                    onChange={handleInputChange}
                                                    placeholder="Seu banco..."
                                                    className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-[15px]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={prevStep}
                                    className="w-20 bg-zinc-100 text-black py-4 rounded-xl flex items-center justify-center hover:bg-zinc-200 transition-all"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <button
                                    onClick={saveStep2}
                                    disabled={loading}
                                    className="flex-1 bg-black text-white py-4 px-8 rounded-xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-900 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loading ? 'Salvando...' : 'Finalizar Configuração'} <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DOCUMENTS */}
                    {currentStep === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2 text-center lg:text-left">
                                <h2 className="text-[32px] font-bold tracking-tight text-black leading-tight">Documentação</h2>
                                <p className="text-[15px] text-zinc-500 font-medium">Fotos nítidas garantem uma aprovação mais rápida.</p>
                            </div>

                            <div className="space-y-6">
                                {/* CNH Upload */}
                                <div className="space-y-2">
                                    <p className="text-[12px] font-bold text-black uppercase tracking-wider">Foto da CNH</p>
                                    <label className={`w-full h-[180px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all overflow-hidden relative ${formData.cnh_foto_url ? 'border-zinc-200' : 'border-zinc-300 hover:border-black'
                                        }`}>
                                        {formData.cnh_foto_url ? (
                                            <>
                                                <img src={formData.cnh_foto_url} alt="CNH" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                                                    <Camera color="white" size={32} />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center">
                                                    <Camera size={24} className="text-zinc-400" />
                                                </div>
                                                <p className="text-[13px] font-bold text-zinc-400">Clique para enviar CNH</p>
                                            </>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'cnh_foto_url')} />
                                    </label>
                                </div>

                                {/* Veiculo Upload */}
                                <div className="space-y-2">
                                    <p className="text-[12px] font-bold text-black uppercase tracking-wider">Foto do Caminhão (com placa)</p>
                                    <label className={`w-full h-[180px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all overflow-hidden relative ${formData.veiculo_foto_url ? 'border-zinc-200' : 'border-zinc-300 hover:border-black'
                                        }`}>
                                        {formData.veiculo_foto_url ? (
                                            <>
                                                <img src={formData.veiculo_foto_url} alt="Veiculo" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                                                    <Camera color="white" size={32} />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center">
                                                    <Truck size={24} className="text-zinc-400" />
                                                </div>
                                                <p className="text-[13px] font-bold text-zinc-400">Clique para enviar foto do veículo</p>
                                            </>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'veiculo_foto_url')} />
                                    </label>
                                </div>

                                <div className="p-4 bg-zinc-50 rounded-xl flex gap-3 border border-zinc-100">
                                    <Shield size={20} className="text-zinc-400 shrink-0 mt-0.5" />
                                    <p className="text-[12px] text-zinc-500 font-medium leading-relaxed">
                                        Nossa equipe analisará seus documentos em até <span className="font-bold text-black">24h úteis</span> para liberar o recebimento de chamados.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={prevStep}
                                    className="w-20 bg-zinc-100 text-black py-4 rounded-xl flex items-center justify-center hover:bg-zinc-200 transition-all"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <button
                                    onClick={finalizeOnboarding}
                                    disabled={loading || !formData.cnh_foto_url || !formData.veiculo_foto_url}
                                    className="flex-1 bg-black text-white py-4 px-8 rounded-xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-900 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loading ? 'Salvando...' : 'Finalizar Cadastro'} <CheckCircle size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="p-6 md:px-12 border-t border-zinc-50 bg-white">
                <div className="max-w-[480px] mx-auto flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Ambiente 100% Seguro</span>
                    </div>
                    <p className="text-[10px] text-zinc-300 font-medium text-center">
                        Seus dados são protegidos por criptografia de ponta a ponta e usados apenas para verificação cadastral.
                    </p>
                </div>
            </footer>
        </div>
    );
}
