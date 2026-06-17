import { supabase } from '../supabase';

export type GroupData = {
    id: string;
    title: string;
    tutor: string;
    color: string;
    participants: number;
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
