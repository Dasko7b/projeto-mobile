import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { PlusCircle, Users } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

type Group = { id: string; name: string };

export default function GroupsScreen({ navigation }: any) {
    const { user } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchGroups = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('groups')
            .select(`id, name, group_members!inner(user_id)`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Erro ao buscar grupos:", error);
        } else if (data) {
            setGroups(data);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchGroups();
        setRefreshing(false);
    }, []);

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nenhum grupo encontrado 😢</Text>
            <Text style={styles.emptySubtitle}>Você ainda não faz parte de nenhuma divisão de despesas.</Text>
            <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateGroup')}>
                <PlusCircle color="#fff" size={24} style={{ marginRight: 8 }} />
                <Text style={styles.createButtonText}>Criar meu primeiro grupo</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={groups}
                keyExtractor={(item) => item.id}
                contentContainerStyle={groups.length === 0 ? { flex: 1 } : { padding: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={renderEmptyState}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.groupCard}
                        onPress={() => navigation.navigate('GroupDetails', { groupId: item.id, groupName: item.name })}
                    >
                        <Users color="#007AFF" size={24} style={{ marginRight: 12 }} />
                        <Text style={styles.groupName}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
            {groups.length > 0 && (
                <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateGroup')}>
                    <PlusCircle color="#fff" size={32} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#112332', marginBottom: 8 },
    emptySubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
    createButton: { flexDirection: 'row', backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center' },
    createButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    groupCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 12, elevation: 2 },
    groupName: { fontSize: 18, fontWeight: '600' },
    fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#007AFF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 }
});