import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

const isValidUrl = (url?: string) => {
    if (!url) return false;
    try {
        new URL(url);
        return url.startsWith('http://') || url.startsWith('https://');
    } catch {
        return false;
    }
};

export const isSupabaseConfigured = !!supabaseUrl && 
                                    !!supabaseAnonKey && 
                                    supabaseUrl !== 'coloque_a_url_aqui' && 
                                    supabaseAnonKey !== 'coloque_a_chave_anon_aqui' && 
                                    isValidUrl(supabaseUrl);

export const supabase = isSupabaseConfigured 
    ? createClient(supabaseUrl!, supabaseAnonKey!) 
    : (null as any);