'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createClient } from '../utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

type UserRole = 'cliente' | 'motorista' | 'admin' | null;

interface AuthContextType {
    session: Session | null;
    user: User | null;
    userRole: UserRole;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    userRole: null,
    isLoading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

const supabase = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchUserRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('perfis')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setUserRole(data?.role as UserRole);
        } catch (error) {
            console.error('Error fetching role:', error);
            setUserRole(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            console.log("AuthContext: Iniciando initializeAuth...");
            try {
                const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) {
                    console.error("AuthContext: Erro ao buscar sessão:", sessionError);
                }
                console.log("AuthContext: Sessão inicial retornou:", initialSession ? `Logado (${initialSession.user.email})` : "Não logado");

                setSession(initialSession);
                setUser(initialSession?.user || null);

                if (initialSession) {
                    console.log("AuthContext: Carregando role para usuário:", initialSession.user.id);
                    await fetchUserRole(initialSession.user.id);
                } else {
                    console.log("AuthContext: Sem sessão, encerrando loading.");
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('AuthContext: Erro crítico na inicialização:', error);
                setIsLoading(false);
            }
        };

        initializeAuth();

        console.log("AuthContext: Configurando onAuthStateChange listener...");
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("AuthContext: onAuthStateChange disparado. Evento:", event, "Sessão:", session ? "Presente" : "Nula");
            setSession(session);
            setUser(session?.user || null);

            if (session) {
                await fetchUserRole(session.user.id);
            } else {
                console.log("AuthContext: Logout detectado, limpando role.");
                setUserRole(null);
                setIsLoading(false);
            }
        });

        return () => {
            console.log("AuthContext: Limpando useEffect...");
            subscription.unsubscribe();
        };
    }, []); // Run only once on mount

    // Handle redirection in a separate useEffect
    useEffect(() => {
        if (isLoading) return;

        const isPublicRoute =
            pathname === '/' ||
            pathname === '/login' ||
            pathname === '/cadastro' ||
            pathname === '/cadastro-motorista' ||
            pathname === '/para-empresas';

        console.log(`AuthContext: Verificando acesso. Path: ${pathname}, Public: ${isPublicRoute}, Role: ${userRole}`);

        if (!session && !isPublicRoute) {
            console.log("AuthContext: Usuário não logado em rota privada. Redirecionando para /login.");
            router.push('/login');
        }
    }, [pathname, session, userRole, isLoading, router]);

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ session, user, userRole, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
