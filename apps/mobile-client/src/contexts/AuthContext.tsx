import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type UserRole = 'cliente' | 'motorista' | 'admin' | null;

interface AuthContextType {
    session: Session | null;
    userRole: UserRole | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    userRole: null,
    isLoading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Determine the initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            fetchUserRole(session);
        });

        // Listen to auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            fetchUserRole(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (currentSession: Session | null) => {
        if (!currentSession?.user) {
            setUserRole(null);
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('perfis')
                .select('role')
                .eq('id', currentSession.user.id)
                .single();

            if (error) throw error;

            setUserRole(data?.role as UserRole);
        } catch (error) {
            console.error('Error fetching user role from DB, falling back to JWT metadata:', error);
            // Fallback to role stored in JWT metadata upon signup
            const metaRole = currentSession.user.user_metadata?.role;
            setUserRole((metaRole as UserRole) || null);
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, userRole, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
