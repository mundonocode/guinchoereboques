'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { User, LogOut, Settings, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ClientePerfilPage() {
    const { user, userRole, signOut } = useAuth();
    const supabase = createClient();
    const [nome, setNome] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('perfis')
                    .select('nome_completo')
                    .eq('id', user.id)
                    .single();

                if (!error && data) {
                    setNome(data.nome_completo);
                }
            } catch (err) {
                console.error('Error fetching profile name', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, supabase]);

    const MenuItem = ({ icon: Icon, title, isDestructive = false, onClick, href }: any) => {
        const Content = () => (
            <>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 shrink-0 ${isDestructive ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <Icon size={20} className={isDestructive ? 'text-red-500' : 'text-gray-900'} />
                </div>
                <span className={`flex-1 text-base font-medium ${isDestructive ? 'text-red-500' : 'text-gray-800'}`}>
                    {title}
                </span>
                {!isDestructive && <ChevronRight size={20} className="text-gray-300" />}
            </>
        );

        const className = "flex items-center w-full px-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left";

        if (href) {
            return (
                <Link href={href} className={className}>
                    <Content />
                </Link>
            );
        }

        return (
            <button onClick={onClick} className={className}>
                <Content />
            </button>
        );
    };

    return (
        <div className="flex flex-col min-h-[100dvh] bg-gray-50 pt-6 pb-24 px-5">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>

            <div className="bg-white rounded-2xl p-5 flex items-center shadow-sm mb-8 border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mr-4 shrink-0">
                    <User size={32} className="text-white" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mb-1" />
                    ) : (
                        <h2 className="text-lg font-bold text-gray-800 mb-1">{nome || 'Usuário Cliente'}</h2>
                    )}
                    <p className="text-sm text-gray-500 mb-2 truncate">{user?.email}</p>
                    <div className="bg-gray-100 px-2 py-1 rounded inline-flex self-start">
                        <span className="text-[10px] font-bold text-gray-900">
                            CONTA {(userRole ?? 'cliente').toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            <h3 className="text-base font-semibold text-gray-600 mb-3 px-1">Configurações</h3>
            <div className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden border border-gray-100">
                <MenuItem
                    icon={User}
                    title="Editar Dados Pessoais"
                    href="/cliente/perfil/editar"
                />
                <MenuItem
                    icon={Shield}
                    title="Privacidade e Termos"
                    href="/cliente/perfil/privacidade"
                />
                <MenuItem
                    icon={Settings}
                    title="Notificações"
                    onClick={() => { alert("Configurações de notificações em breve!") }}
                />
            </div>

            <h3 className="text-base font-semibold text-gray-600 mb-3 px-1">Suporte</h3>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 mb-6">
                <MenuItem
                    icon={HelpCircle}
                    title="Ajuda e Contato"
                    href="/cliente/perfil/ajuda"
                />
                <MenuItem
                    icon={LogOut}
                    title="Sair da Conta"
                    isDestructive={true}
                    onClick={() => signOut()}
                />
            </div>
        </div>
    );
}
