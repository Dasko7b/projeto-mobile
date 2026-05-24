import { Flame, LayersPlus, UsersRound } from 'lucide-react-native';
import { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type GroupData = {
    id: string;
    title: string;
    tutor: string;
    color: string;
    participants: number;
};

const mockGroups: GroupData[] = [
    {
        id: '1',
        title: 'Comida na casa do Matheus',
        tutor: 'Matheus Silva',
        color: '#AEE7F8',
        participants: 6,
    },
    {
        id: '2',
        title: 'Praia dos Crias',
        tutor: 'Mauro Oruam',
        color: '#F2F56B',
        participants: 8,
    },
    {
        id: '3',
        title: 'Thiago teste testinho',
        tutor: 'Thiago',
        color: '#9EF0A8',
        participants: 4,
    },
];

export default function GroupsScreen({ navigation }: any) {
    const [groups] = useState<GroupData[]>(mockGroups);
    const hasGroups = groups.length > 0;

    function handleCreateGroup() {
        navigation.navigate('CreateGroup');
    }

    function handleGroupPress(group: GroupData) {
        navigation.navigate('GroupDetails', { group });
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>
                        Seus grupos
                        <Flame size={36} color="#ff0000" fill="#ff0000" />
                    </Text>
                    <Text style={styles.subtitle}>
                        Rache, controle e pague com quem participa com você.
                    </Text>
                </View>

                <TouchableOpacity style={styles.createIconButton} onPress={handleCreateGroup}>
                    <LayersPlus size={28} color="#0044ff" fill="#0044ff" />
                </TouchableOpacity>
            </View>

            {hasGroups ? (
                <FlatList
                    data={groups}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            activeOpacity={0.86}
                            onPress={() => handleGroupPress(item)}
                            style={[styles.card, { backgroundColor: item.color }]}
                        >
                            <Text style={styles.tutor}>{item.tutor}</Text>
                            <Text style={styles.category}>Racha</Text>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.info}>{item.participants} participantes</Text>

                            <View style={styles.cardButton}>
                                <Text style={styles.arrow}>↗</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListFooterComponent={(
                        <TouchableOpacity style={styles.createCard} onPress={handleCreateGroup}>
                            <View style={styles.createCircle}>
                                <LayersPlus size={30} color="#0044ff" fill="#0044ff" />
                            </View>
                            <View style={styles.createTextArea}>
                                <Text style={styles.createTitle}>Criar um novo Racha?</Text>
                                <Text style={styles.createSubtitle}>Monte outro grupo para separar as despesas.</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <UsersRound size={44} color="#112332" />
                    </View>

                    <Text style={styles.emptyTitle}>Você ainda não participa de grupos</Text>
                    <Text style={styles.emptyText}>
                        Crie seu primeiro Racha para convidar pessoas, registrar despesas e acompanhar os pagamentos.
                    </Text>

                    <TouchableOpacity style={styles.emptyButton} onPress={handleCreateGroup}>
                        <LayersPlus size={24} color="#fff" />
                        <Text style={styles.emptyButtonText}>Criar grupo</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingTop: 54,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 18,
        alignItems: 'flex-start',
        marginBottom: 22,
    },
    title: {
        fontFamily: 'Inter_700Bold',
        fontSize: 40,
        color: '#112332',
    },
    subtitle: {
        maxWidth: 260,
        marginTop: 8,
        fontSize: 16,
        lineHeight: 23,
        color: '#5f6b76',
    },
    createIconButton: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    list: {
        gap: 20,
        paddingBottom: 120,
    },
    card: {
        width: '100%',
        minHeight: 220,
        borderRadius: 32,
        padding: 24,
        justifyContent: 'space-between',
    },
    tutor: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
    },
    category: {
        fontSize: 14,
        opacity: 0.6,
        color: '#111',
    },
    cardTitle: {
        maxWidth: '82%',
        fontSize: 34,
        fontWeight: 'bold',
        color: '#000',
    },
    info: {
        fontSize: 14,
        color: '#111',
    },
    cardButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrow: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    createCard: {
        minHeight: 132,
        borderRadius: 28,
        padding: 20,
        backgroundColor: '#112332',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
    },
    createCircle: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    createTextArea: {
        flex: 1,
    },
    createTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    createSubtitle: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
        color: '#d7dee6',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 80,
    },
    emptyIcon: {
        width: 92,
        height: 92,
        borderRadius: 46,
        backgroundColor: '#F2F56B',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 22,
    },
    emptyTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 30,
        lineHeight: 36,
        textAlign: 'center',
        color: '#112332',
    },
    emptyText: {
        marginTop: 12,
        marginBottom: 26,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        color: '#5f6b76',
    },
    emptyButton: {
        minHeight: 56,
        borderRadius: 28,
        paddingHorizontal: 24,
        backgroundColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
});
