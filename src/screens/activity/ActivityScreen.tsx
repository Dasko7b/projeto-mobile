import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { History, ReceiptText } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import ExpenseCard from '../../components/ExpenseCard/ExpenseCard';
import { styles } from '../../styles/activity/ActivityScreen.styles';

type ActivityItem = {
    id: string;
    descricao: string;
    valor: number;
    created_at: string;
    receipt_url?: string | null;
    group_name: string;
    payer_name: string;
};

export default function ActivityScreen({ navigation }: any) {
    const { user } = useAuth();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    async function loadActivities() {
        if (!user) return;
        
        try {
            // Fetch expenses. RLS automatically filters to only show expenses for the user's groups.
            // We select '*' so all columns (including paid_by) are fetched, plus nested relationships
            let { data, error } = await supabase
                .from('expenses')
                .select(`
                    *,
                    groups ( nome ),
                    users:paid_by ( nome )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                // Try alternative join syntax if first one fails due to schema mapping
                const altQuery = await supabase
                    .from('expenses')
                    .select(`
                        *,
                        groups ( nome )
                    `)
                    .order('created_at', { ascending: false });
                
                if (altQuery.error) throw altQuery.error;
                
                // Fetch profiles separately for robust fallback
                if (altQuery.data && altQuery.data.length > 0) {
                    const expensesData = altQuery.data;
                    const { data: usersData } = await supabase
                        .from('users')
                        .select('id, nome');
                    
                    const userMap = new Map(usersData?.map((u: any) => [u.id, u.nome]) || []);
                    
                    const mapped: ActivityItem[] = expensesData.map((exp: any) => ({
                        id: exp.id,
                        descricao: exp.descricao,
                        valor: Number(exp.valor),
                        created_at: exp.created_at,
                        receipt_url: exp.receipt_url,
                        group_name: exp.groups?.nome || 'Grupo sem nome',
                        payer_name: userMap.get(exp.paid_by) || 'Membro do grupo',
                    }));
                    setActivities(mapped);
                    return;
                }
                data = [];
            }

            if (data) {
                const mapped: ActivityItem[] = data.map((exp: any) => ({
                    id: exp.id,
                    descricao: exp.descricao,
                    valor: Number(exp.valor),
                    created_at: exp.created_at,
                    receipt_url: exp.receipt_url,
                    group_name: exp.groups?.nome || 'Grupo sem nome',
                    payer_name: exp.users?.nome || 'Membro do grupo',
                }));
                setActivities(mapped);
            }
        } catch (err: any) {
            console.error("Erro ao carregar atividades:", err);
            Alert.alert("Erro", "Não foi possível carregar as atividades recentes.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadActivities();

        const unsubscribe = navigation.addListener('focus', () => {
            loadActivities();
        });

        return unsubscribe;
    }, [navigation, user?.id]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadActivities();
    };

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Atividades</Text>
                <Text style={styles.subtitle}>Extrato de movimentações de todos os seus Rachas</Text>
            </View>

            {activities.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <EmptyState
                        icon={History}
                        title="Nenhuma atividade encontrada"
                        description="As despesas adicionadas nos seus grupos aparecerão organizadas aqui por data."
                    />
                </View>
            ) : (
                <FlatList
                    data={activities}
                    keyExtractor={(item) => item.id}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <ExpenseCard
                            title={item.descricao}
                            author={`${item.payer_name} no grupo "${item.group_name}"`}
                            value={item.valor}
                            date={formatDate(item.created_at)}
                            receiptUrl={item.receipt_url}
                            onPressReceipt={item.receipt_url ? () => {
                                Alert.alert("Comprovante", `URL do recibo: ${item.receipt_url}`);
                            } : undefined}
                        />
                    )}
                />
            )}
        </View>
    );
}
