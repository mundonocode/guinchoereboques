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
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                console.log("AuthContext: Sessão inicial:", initialSession ? "Logado" : "Não logado");
                setSession(initialSession);
                setUser(initialSession?.user || null);
                if (initialSession) {
                    await fetchUserRole(initialSession.user.id);
                } else {
                    console.log("AuthContext: Sem sessão, encerrando loading.");
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('AuthContext: Erro na inicialização:', error);
                setIsLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user || null);
            if (session) {
                await fetchUserRole(session.user.id);
            } else {
                setUserRole(null);
                setIsLoading(false);
                const isPublicRoute =
                    pathname === '/' ||
                    pathname === '/login' ||
                    pathname === '/cadastro' ||
                    pathname === '/cadastro-motorista' ||
                    pathname === '/para-empresas';

                if (!isPublicRoute && !isLoading && !userRole) {
                    router.push('/login');
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [pathname, router]);

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
