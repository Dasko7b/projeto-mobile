import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Share } from 'react-native';
import { Share as ShareIcon, Plus } from 'lucide-react-native';
import { supabase } from '../../services/supabase';

type Expense = { id: string; description: string; amount: number; user_id: string; receipt_url?: string };

export default function GroupDetailsScreen({ route, navigation }: any) {
    const { groupId, groupName } = route.params;
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [total, setTotal] = useState(0);

    const fetchExpenses = async () => {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('group_id', groupId)
            .order('created_at', { ascending: false });

        if (data) {
            setExpenses(data);
            const sum = data.reduce((acc, curr) => acc + Number(curr.amount), 0);
            setTotal(sum);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [groupId]);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Ei! Junta-te ao meu grupo "${groupName}" no FechaConta.\n\nCódigo do Grupo: ${groupId}\n\nBaixa o app e entra para dividirmos as contas!`,
            });
        } catch (error: any) {
            console.error(error.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.totalText}>Total do Grupo: R$ {total.toFixed(2)}</Text>
                <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                    <ShareIcon color="#007AFF" size={24} />
                    <Text style={{ color: '#007AFF', marginLeft: 8 }}>Convidar</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.expenseCard}>
                        <Text style={styles.desc}>{item.description}</Text>
                        <Text style={styles.amount}>R$ {item.amount.toFixed(2)}</Text>
                    </View>
                )}
            />

            <TouchableOpacity 
                style={styles.addExpenseButton}
                onPress={() => navigation.navigate('AddExpenseModal', { groupId })}
            >
                <Plus color="#fff" size={24} />
                <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>Nova Despesa</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: '#fff', padding: 16, borderRadius: 12 },
    totalText: { fontSize: 18, fontWeight: 'bold' },
    shareButton: { flexDirection: 'row', alignItems: 'center' },
    expenseCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
    desc: { fontSize: 16 },
    amount: { fontSize: 16, fontWeight: 'bold', color: '#ff3b30' },
    addExpenseButton: { flexDirection: 'row', backgroundColor: '#000', padding: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 }
});