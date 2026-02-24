'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, User, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
    const router = useRouter();
    const { user } = useAuth();
    const supabase = createClient();

    const [loadingInit, setLoadingInit] = useState(true);
    const [saving, setSaving] = useState(false);

    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    // const [fotoUrl, setFotoUrl] = useState<string | null>(null);

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        setCpf(value);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        setTelefone(value);
    };

    useEffect(() => {
        async function fetchProfile() {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('perfis')
                    .select('nome_completo, cpf, telefone, foto_url')
                    .eq('id', user.id)
                    .single();

                if (!error && data) {
                    setNome(data.nome_completo || '');
                    setCpf(data.cpf || '');
                    setTelefone(data.telefone || '');
                    // if (data.foto_url) setFotoUrl(data.foto_url);
                }
            } catch (err) {
                console.error('Error fetching profile details', err);
            } finally {
                setLoadingInit(false);
            }
        }
        fetchProfile();
    }, [user, supabase]);

    const handleSave = async () => {
        if (!nome) {
            alert('Atenção: O campo Nome é obrigatório.');
            return;
        }

        setSaving(true);
        try {
            // let finalFotoUrl = fotoUrl;
            // PWA avatar upload future improvement goes here

            const { error } = await supabase
                .from('perfis')
                .update({
                    nome_completo: nome,
                    cpf: cpf,
                    telefone: telefone,
                    // foto_url: finalFotoUrl,
                    // avatar_url: finalFotoUrl
                })
                .eq('id', user?.id);

            if (error) throw error;
            router.replace('/cliente/perfil');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert('Não foi possível atualizar seu perfil. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    if (loadingInit) {
        return (
            <div className="flex flex-col min-h-[100dvh] bg-gray-50">
                <div className="flex items-center px-4 py-4 bg-white border-b border-gray-100">
                    <button onClick={() => router.replace('/cliente/perfil')} className="p-2 -ml-2">
                        <ArrowLeft size={24} className="text-gray-900" />
                    </button>
                    <h1 className="flex-1 text-center text-[18px] font-bold text-gray-900 pr-8">Editar Perfil</h1>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[100dvh] bg-gray-50">
            <div className="flex items-center px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
                <button onClick={() => router.replace('/cliente/perfil')} className="p-2 -ml-2 disabled:opacity-50" disabled={saving}>
                    <ArrowLeft size={24} className="text-gray-900" />
                </button>
                <h1 className="flex-1 text-center text-[18px] font-bold text-gray-900 pr-8">Editar Perfil</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
                <div className="flex flex-col items-center mb-8 mt-4 relative">
                    <button className="relative w-[100px] h-[100px] rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200" disabled={saving}>
                        <User size={40} className="text-gray-400" />
                        <div className="absolute bottom-0 right-0 bg-gray-900 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white">
                            <Camera size={14} className="text-white" />
                        </div>
                    </button>
                    <p className="text-[12px] text-gray-500 mt-3">Toque para alterar sua foto (Breve)</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-8">
                    <label className="block text-[14px] font-semibold text-gray-700 mb-2">Nome Completo *</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl h-[52px] px-4 text-[16px] text-gray-900 mb-5 outline-none focus:border-gray-400 transition-colors"
                    />

                    <label className="block text-[14px] font-semibold text-gray-700 mb-2">CPF</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={14}
                        value={cpf}
                        onChange={handleCpfChange}
                        placeholder="000.000.000-00"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl h-[52px] px-4 text-[16px] text-gray-900 mb-5 outline-none focus:border-gray-400 transition-colors"
                    />

                    <label className="block text-[14px] font-semibold text-gray-700 mb-2">Telefone / WhatsApp</label>
                    <input
                        type="text"
                        inputMode="tel"
                        maxLength={15}
                        value={telefone}
                        onChange={handlePhoneChange}
                        placeholder="(00) 00000-0000"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl h-[52px] px-4 text-[16px] text-gray-900 mb-5 outline-none focus:border-gray-400 transition-colors"
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-[56px] rounded-2xl bg-gray-900 text-white font-bold text-[16px] flex items-center justify-center mb-8 shadow-sm active:scale-[0.98] transition-transform disabled:opacity-75 disabled:active:scale-100"
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        'Salvar Alterações'
                    )}
                </button>
            </div>
        </div>
    );
}
