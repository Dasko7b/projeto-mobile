import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { Session, User } from "@supabase/supabase-js";

export type Profile = {
    id: string;
    nome: string;
    email: string;
    avatarUrl: string;
};

type AuthContextType = {
    user: Profile | null;
    session: Session | null;
    loading: boolean;
    consolidatedBalance: number;
    refreshConsolidatedBalance: () => Promise<void>;
    signOut: () => Promise<void>;
    fetchUserProfile: (sessionUser: User) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    consolidatedBalance: 0,
    refreshConsolidatedBalance: async () => {},
    signOut: async () => {},
    fetchUserProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [consolidatedBalance, setConsolidatedBalance] = useState(0);

    async function fetchUserProfile(sessionUser: User) {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", sessionUser.id)
                .single();

            if (error) {
                setUser({
                    id: sessionUser.id,
                    nome: sessionUser.user_metadata?.nome || "Usuário",
                    email: sessionUser.email || "",
                    avatarUrl: sessionUser.user_metadata?.avatarUrl || `https://i.pravatar.cc/150?u=${sessionUser.id}`,
                });
                return;
            }

            if (data) {
                setUser({
                    id: data.id,
                    nome: data.nome,
                    email: data.email,
                    avatarUrl: `https://i.pravatar.cc/150?u=${data.id}`,
                });
            }
        } catch (err) {
            console.error("Erro ao buscar perfil:", err);
        }
    }

    async function refreshConsolidatedBalance() {
        if (!session?.user) return;
        try {
            const { data, error } = await supabase
                .from("vw_group_balances")
                .select("saldo_final")
                .eq("user_id", session.user.id);

            if (error) {
                setConsolidatedBalance(0);
                return;
            }

            if (data) {
                const total = data.reduce((sum: number, item: any) => sum + Number(item.saldo_final || 0), 0);
                setConsolidatedBalance(total);
            } else {
                setConsolidatedBalance(0);
            }
        } catch (err) {
            console.error("Erro ao carregar saldo consolidado:", err);
        }
    }

    async function signOut() {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setConsolidatedBalance(0);
    }

    useEffect(() => {
        supabase.auth.getSession().then((res: any) => {
            const session = res.data?.session || null;
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            setSession(session);
            if (session?.user) {
                await fetchUserProfile(session.user);
            } else {
                setUser(null);
                setConsolidatedBalance(0);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (session?.user) {
            refreshConsolidatedBalance();
        }
    }, [session, user?.id]);

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                consolidatedBalance,
                refreshConsolidatedBalance,
                signOut,
                fetchUserProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
