import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getActivities } from '../services/api/activity.api';
import type { ActivityItem } from '../services/api/activity.api';

export function useActivity(navigation: any) {
    const { user } = useAuth();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    async function loadActivities() {
        if (!user) {
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            const activityData = await getActivities();
            setActivities(activityData);
        } catch (err: any) {
            console.error('Erro ao carregar atividades:', err);
            Alert.alert('Erro', 'Não foi possível carregar as atividades recentes.');
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

    function handleRefresh() {
        setRefreshing(true);
        loadActivities();
    }

    function handleReceiptPress(receiptUrl?: string | null) {
        if (!receiptUrl) return;

        Alert.alert('Comprovante', `URL do recibo: ${receiptUrl}`);
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return {
        activities,
        loading,
        refreshing,
        handleRefresh,
        handleReceiptPress,
        formatDate,
    };
}
