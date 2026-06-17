import { supabase } from '../supabase';

export type GroupData = {
    id: string;
    title: string;
    tutor: string;
    color: string;
    participants: number;
};

export type Member = {
    user_id: string;
    users: {
        id: string;
        nome: string;
        email: string;
    };
};

export type Expense = {
    id: string;
    descricao: string;
    valor: number;
    paid_by: string;
    receipt_url: string | null;
    created_at: string;
    users?: {
        nome: string;
    };
};

export type GroupDetailsData = {
    members: Member[];
    expenses: Expense[];
};

export type JoinGroupResult =
    | {
        status: 'joined';
        groupName: string;
    }
    | {
        status: 'already-member';
    }
    | {
        status: 'not-found';
    };

const PASTEL_COLORS = ['#AEE7F8', '#F2F56B', '#9EF0A8', '#F8AEEC', '#F8B6AE'];

function getGroupColor(groupId: string) {
    const hash = groupId
        .split('')
        .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);

    return PASTEL_COLORS[Math.abs(hash) % PASTEL_COLORS.length];
}

export async function getGroups(): Promise<GroupData[]> {
    const { data, error } = await supabase
        .from('groups')
        .select(`
            id,
            nome,
            group_members (
                user_id,
                users ( nome )
            )
        `);

    if (error) throw error;

    return (data || []).map((group: any) => {
        const tutorName = group.group_members?.[0]?.users?.nome || 'Membro';

        return {
            id: group.id,
            title: group.nome,
            tutor: tutorName,
            color: getGroupColor(group.id),
            participants: group.group_members?.length || 0,
        };
    });
}

export async function getGroupDetails(groupId: string): Promise<GroupDetailsData> {
    const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('user_id, users ( id, nome, email )')
        .eq('group_id', groupId);

    if (membersError) throw membersError;

    const members: Member[] = (membersData || []).map((member: any) => ({
        user_id: member.user_id,
        users: Array.isArray(member.users) ? member.users[0] : member.users,
    }));

    const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*, users:paid_by ( nome )')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

    if (!expensesError) {
        return {
            members,
            expenses: (expensesData || []).map((expense: any) => ({
                ...expense,
                valor: Number(expense.valor),
            })),
        };
    }

    const { data: fallbackData, error: fallbackError } = await supabase
        .from('expenses')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

    if (fallbackError) throw fallbackError;

    const { data: usersData } = await supabase
        .from('users')
        .select('id, nome');

    const userMap = new Map((usersData || []).map((user: any) => [user.id, user.nome]));

    return {
        members,
        expenses: (fallbackData || []).map((expense: any) => ({
            ...expense,
            valor: Number(expense.valor),
            users: { nome: userMap.get(expense.paid_by) || 'Membro' },
        })),
    };
}

export async function uploadReceiptImage(uri: string): Promise<string | null> {
    const response = await fetch(uri);
    const blob = await response.blob();

    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    const { error } = await supabase.storage
        .from('receipts')
        .upload(filePath, blob, {
            contentType: 'image/jpeg',
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

    return publicUrl;
}

export async function createExpense(params: {
    groupId: string;
    paidBy: string;
    value: number;
    description: string;
    receiptUrl?: string | null;
}) {
    const { error } = await supabase
        .from('expenses')
        .insert({
            group_id: params.groupId,
            paid_by: params.paidBy,
            valor: params.value,
            descricao: params.description,
            receipt_url: params.receiptUrl ?? null,
        });

    if (error) throw error;
}

export async function settleGroupPayment(params: {
    groupId: string;
    payerId: string;
    receiverId: string;
    value: number;
}) {
    return createExpense({
        groupId: params.groupId,
        paidBy: params.payerId,
        value: params.value,
        description: `Liquidação: para ${params.receiverId}`,
        receiptUrl: null,
    });
}

export async function joinGroup(groupId: string, userId: string): Promise<JoinGroupResult> {
    const { error: joinError } = await supabase
        .from('group_members')
        .insert({
            group_id: groupId,
            user_id: userId,
        });

    if (joinError) {
        if (joinError.code === '23505') {
            return { status: 'already-member' };
        }

        if (joinError.code === '23503') {
            return { status: 'not-found' };
        }

        throw joinError;
    }

    const { data: groupData } = await supabase
        .from('groups')
        .select('nome')
        .eq('id', groupId)
        .single();

    return {
        status: 'joined',
        groupName: groupData?.nome || 'Novo Racha',
    };
}
