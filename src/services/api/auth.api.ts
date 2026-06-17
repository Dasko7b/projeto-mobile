import { supabase } from '../supabase';

type LoginParams = {
    email: string;
    password: string;
};

type RegisterParams = {
    nome: string;
    email: string;
    password: string;
};

export async function login({ email, password }: LoginParams) {
    return supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
    });
}

export async function register({ nome, email, password }: RegisterParams) {
    return supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
            data: {
                nome: nome.trim(),
            },
        },
    });
}
