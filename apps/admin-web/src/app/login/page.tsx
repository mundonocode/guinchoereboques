'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Truck, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const supabase = createClient();

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { session, userRole, isLoading } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (!isLoading && session && userRole) {
            handleRedirect(userRole);
        }
    }, [session, userRole, isLoading]);

    const handleRedirect = (role: string) => {
        switch (role) {
            case 'admin':
                router.push('/');
                break;
            case 'motorista':
                router.push('/motorista');
                break;
            case 'cliente':
                router.push('/cliente');
                break;
            default:
                setError('Acesso não autorizado para esta função.');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // The AuthContext will pick up the session and handle redirection via useEffect above
            // But we can also do a quick check here if we want immediate feedback
            const { data: profile } = await supabase
                .from('perfis')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profile) {
                handleRedirect(profile.role);
            } else {
                setError('Perfil não encontrado.');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-white font-sans selection:bg-amber-500 selection:text-black">
            {/* Left Side: Visual/Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-black items-center justify-center p-12 text-white relative overflow-hidden">
                {/* Amber Glow Effects */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-[-10%] -left-[10%] w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] -right-[10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-xl">
                    <div className="flex items-center gap-3 mb-10">
                        <Link href="/">
                            <img src="/logo-oficial.png.png" alt="Guinchos e Reboques" className="w-[200px] h-auto object-contain cursor-pointer transition-opacity hover:opacity-80" />
                        </Link>
                    </div>

                    <h2 className="text-[38px] font-poppins font-medium mb-8 leading-[1.1] tracking-tight text-white">
                        A ajuda que você precisa, <span className="font-bold text-amber-500 text-nowrap">exatamente quando precisa.</span>
                    </h2>

                    <p className="text-[17px] text-white/60 font-medium leading-relaxed max-w-lg mb-12">
                        Conectamos motoristas a guinchos e reboques em segundos. Simples como chamar um Uber, seguro como deve ser.
                    </p>

                    <div className="grid grid-cols-2 gap-12 pt-8 border-t border-white/10">
                        <div className="space-y-1">
                            <p className="text-3xl font-poppins font-bold text-white tracking-tight">Socorro</p>
                            <p className="text-[11px] text-white/40 font-black uppercase tracking-[0.2em]">em minutos</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-3xl font-poppins font-bold text-white tracking-tight">Suporte</p>
                            <p className="text-[11px] text-white/40 font-black uppercase tracking-[0.2em]">Sempre Disponível 24h</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
                <div className="max-w-[400px] w-full space-y-10">
                    <div className="space-y-3">
                        <div className="lg:hidden flex items-center mb-8">
                            <img src="/logo-oficial.png.png" alt="Guinchos e Reboques" className="w-[160px] h-auto object-contain invert" />
                        </div>
                        <h3 className="text-[32px] font-poppins font-bold tracking-tight text-black leading-tight">Bem-vindo de volta</h3>
                        <p className="text-[15px] text-zinc-500 font-medium">Acesse sua conta para continuar.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-[13px] text-red-600 font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-black flex items-center gap-2 uppercase tracking-wide" htmlFor="email">
                                    <Mail size={14} className="text-zinc-400" /> E-mail
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="exemplo@gmail.com"
                                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all font-medium text-[15px]"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[13px] font-bold text-black flex items-center gap-2 uppercase tracking-wide" htmlFor="password">
                                        <Lock size={14} className="text-zinc-400" /> Senha
                                    </label>
                                    <a href="#" className="text-[12px] font-bold text-amber-600 hover:text-amber-700 transition-colors uppercase tracking-tight">Esqueceu?</a>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all font-medium text-[15px]"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-4 pr-5 pl-7 rounded-md font-black text-xs tracking-[0.1em] uppercase flex items-center justify-center gap-3 hover:bg-zinc-900 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-black/10"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Entrar na conta
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-4 text-center">
                        <p className="text-[14px] text-zinc-500 font-medium">
                            Ainda não tem uma conta? <Link href="/cadastro" className="text-black font-bold hover:underline">Cadastre-se aqui</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

