import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { History } from 'lucide-react-native';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import ExpenseCard from '../../components/ExpenseCard/ExpenseCard';
import { useActivity } from '../../hooks/useActivity';
import { styles } from '../../styles/activity/ActivityScreen.styles';

export default function ActivityScreen({ navigation }: any) {
    const {
        activities,
        loading,
        refreshing,
        handleRefresh,
        handleReceiptPress,
        formatDate,
    } = useActivity(navigation);

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
                                handleReceiptPress(item.receipt_url);
                            } : undefined}
                        />
                    )}
                />
            )}
        </View>
    );
}
