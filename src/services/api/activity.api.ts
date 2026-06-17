import { supabase } from '../supabase';

export type ActivityItem = {
    id: string;
    descricao: string;
    valor: number;
    created_at: string;
    receipt_url?: string | null;
    group_name: string;
    payer_name: string;
};

export async function getActivities(): Promise<ActivityItem[]> {
    let { data, error } = await supabase
        .from('expenses')
        .select(`
            *,
            groups ( nome ),
            users:paid_by ( nome )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        const altQuery = await supabase
            .from('expenses')
            .select(`
                *,
                groups ( nome )
            `)
            .order('created_at', { ascending: false });

        if (altQuery.error) throw altQuery.error;

        if (!altQuery.data || altQuery.data.length === 0) {
            return [];
        }

        const { data: usersData } = await supabase
            .from('users')
            .select('id, nome');

        const userMap = new Map((usersData || []).map((user: any) => [user.id, user.nome]));

        return altQuery.data.map((expense: any) => ({
            id: expense.id,
            descricao: expense.descricao,
            valor: Number(expense.valor),
            created_at: expense.created_at,
            receipt_url: expense.receipt_url,
            group_name: expense.groups?.nome || 'Grupo sem nome',
            payer_name: userMap.get(expense.paid_by) || 'Membro do grupo',
        }));
    }

    return (data || []).map((expense: any) => ({
        id: expense.id,
        descricao: expense.descricao,
        valor: Number(expense.valor),
        created_at: expense.created_at,
        receipt_url: expense.receipt_url,
        group_name: expense.groups?.nome || 'Grupo sem nome',
        payer_name: expense.users?.nome || 'Membro do grupo',
    }));
}
