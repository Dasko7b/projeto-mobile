import { supabase } from '../supabase';

export type ProfileStats = {
    groupsCount: number;
    totalPaid: number;
};

export async function getProfileStats(userId: string): Promise<ProfileStats> {
    const { count: groupsCount, error: groupsError } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (groupsError) throw groupsError;

    const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('valor')
        .eq('paid_by', userId)
        .not('descricao', 'ilike', 'Liquida\u00e7\u00e3o%');

    if (expensesError) throw expensesError;

    const totalPaid = (expensesData || []).reduce(
        (sum: number, item: any) => sum + Number(item.valor),
        0
    );

    return {
        groupsCount: groupsCount || 0,
        totalPaid,
    };
}

export async function updateProfileName(userId: string, nome: string) {
    const trimmedName = nome.trim();

    const { error: updateError } = await supabase
        .from('users')
        .update({ nome: trimmedName })
        .eq('id', userId);

    if (updateError) throw updateError;

    const { error: authError } = await supabase.auth.updateUser({
        data: { nome: trimmedName },
    });

    if (authError) throw authError;
}

export async function updateProfilePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
        password,
    });

    if (error) throw error;
}
