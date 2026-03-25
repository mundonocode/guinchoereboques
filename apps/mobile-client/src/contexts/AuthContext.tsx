import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type UserRole = 'cliente' | 'motorista' | 'admin' | null;

interface AuthContextType {
    session: Session | null;
    userRole: UserRole | null;
    cpf: string | null;
    telefone: string | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    userRole: null,
    cpf: null,
    telefone: null,
    isLoading: true,
    signOut: async () => { },
    refreshProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [cpf, setCpf] = useState<string | null>(null);
    const [telefone, setTelefone] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Determine the initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            fetchProfile(session);
        });

        // Listen to auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            fetchProfile(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (currentSession: Session | null) => {
        if (!currentSession?.user) {
            setUserRole(null);
            setCpf(null);
            setTelefone(null);
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('perfis')
                .select('role, cpf, telefone')
                .eq('id', currentSession.user.id)
                .single();

            if (error) throw error;

            setUserRole(data?.role as UserRole);
            setCpf(data?.cpf || null);
            setTelefone(data?.telefone || null);
        } catch (error) {
            console.error('Error fetching profile from DB:', error);
            // Fallback to role stored in JWT metadata
            const metaRole = currentSession.user.user_metadata?.role;
            setUserRole((metaRole as UserRole) || null);
            setCpf(null);
            setTelefone(null);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshProfile = async () => {
        await fetchProfile(session);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, userRole, cpf, telefone, isLoading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}
