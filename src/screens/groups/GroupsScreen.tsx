import React, { useEffect, useState, useRef } from 'react';
import {
    Animated,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { Flame, LogIn, LayersPlus, Link, X, UsersRound } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import GroupCard from '../../components/GroupCard/GroupCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';

type GroupData = {
    id: string;
    title: string;
    tutor: string;
    color: string;
    participants: number;
};

const PASTEL_COLORS = ['#AEE7F8', '#F2F56B', '#9EF0A8', '#F8AEEC', '#F8B6AE'];

export default function GroupsScreen({ navigation }: any) {
    const { user, refreshConsolidatedBalance } = useAuth();
    const [groups, setGroups] = useState<GroupData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
    const [groupLink, setGroupLink] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);
    
    const joinModalTranslateY = useRef(new Animated.Value(360)).current;

    async function loadGroups() {
        if (!user) return;
        try {
            // RLS automatically filters groups where user is a member
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

            if (data) {
                const mapped: GroupData[] = data.map((g: any) => {
                    // Get tutor/creator name (or first member's name as representative)
                    const tutorName = g.group_members?.[0]?.users?.nome || 'Membro';
                    
                    // Generate a stable color based on group ID hash
                    const hash = g.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                    const color = PASTEL_COLORS[Math.abs(hash) % PASTEL_COLORS.length];

                    return {
                        id: g.id,
                        title: g.nome,
                        tutor: tutorName,
                        color: color,
                        participants: g.group_members?.length || 0,
                    };
                });
                setGroups(mapped);
            }
        } catch (err: any) {
            console.error("Erro ao carregar grupos:", err);
            Alert.alert("Erro", "Não foi possível carregar os seus grupos.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadGroups();

        const unsubscribe = navigation.addListener('focus', () => {
            loadGroups();
            refreshConsolidatedBalance();
        });

        return unsubscribe;
    }, [navigation, user?.id]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadGroups();
        refreshConsolidatedBalance();
    };

    function handleCreateGroup() {
        navigation.navigate('CreateGroup');
    }

    function handleGroupPress(group: GroupData) {
        navigation.navigate('GroupDetails', { group });
    }

    function handleOpenJoinModal() {
        setIsJoinModalVisible(true);
        Animated.timing(joinModalTranslateY, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
        }).start();
    }

    function handleCloseJoinModal() {
        Animated.timing(joinModalTranslateY, {
            toValue: 360,
            duration: 220,
            useNativeDriver: true,
        }).start(() => {
            setIsJoinModalVisible(false);
            setGroupLink('');
            setJoinLoading(false);
        });
    }

    async function handleJoinGroupSubmit() {
        const inviteCode = groupLink.trim();
        if (!inviteCode) {
            if (Platform.OS === 'web') {
                window.alert("Por favor, digite o código ou cole o link do grupo.");
            } else {
                Alert.alert("Erro", "Por favor, digite o código ou cole o link do grupo.");
            }
            return;
        }

        // Handle case where user pastes deep link like fechaconta://grupo/UUID
        let cleanedId = inviteCode;
        if (inviteCode.includes('://')) {
            const parts = inviteCode.split('/');
            cleanedId = parts[parts.length - 1];
        }

        // Basic UUID validation regex
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(cleanedId)) {
            if (Platform.OS === 'web') {
                window.alert("O código do grupo deve ser um identificador UUID válido.");
            } else {
                Alert.alert("Código inválido", "O código do grupo deve ser um identificador UUID válido.");
            }
            return;
        }

        setJoinLoading(true);
        try {
            // Insert member directly (RLS prevents select beforehand because user is not a member yet)
            const { error: joinError } = await supabase
                .from('group_members')
                .insert({
                    group_id: cleanedId,
                    user_id: user?.id
                });

            if (joinError) {
                if (joinError.code === '23505') { // Unique constraint violation
                    if (Platform.OS === 'web') {
                        window.alert("Você já participa deste grupo!");
                    } else {
                        Alert.alert("Aviso", "Você já participa deste grupo!");
                    }
                } else if (joinError.code === '23503') { // Foreign key constraint violation (group doesn't exist)
                    if (Platform.OS === 'web') {
                        window.alert("Grupo não encontrado. Verifique o código e tente novamente.");
                    } else {
                        Alert.alert("Grupo não encontrado", "Verifique o código e tente novamente.");
                    }
                } else {
                    throw joinError;
                }
            } else {
                // Now that the user is a member, they have access to read the group details to show the name in the alert!
                const { data: groupData } = await supabase
                    .from('groups')
                    .select('nome')
                    .eq('id', cleanedId)
                    .single();

                const groupName = groupData?.nome || "Novo Racha";

                if (Platform.OS === 'web') {
                    window.alert(`Você entrou no grupo "${groupName}"!`);
                } else {
                    Alert.alert("Sucesso", `Você entrou no grupo "${groupName}"!`);
                }
                handleCloseJoinModal();
                loadGroups();
                refreshConsolidatedBalance();
            }
        } catch (err: any) {
            console.error("Erro ao entrar no grupo:", err);
            if (Platform.OS === 'web') {
                window.alert("Ocorreu um erro ao tentar se associar a este grupo.");
            } else {
                Alert.alert("Erro ao entrar", "Ocorreu um erro ao tentar se associar a este grupo.");
            }
        } finally {
            setJoinLoading(false);
        }
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>
                        Seus grupos
                        <Flame size={36} color="#2563eb" fill="#2563eb" />
                    </Text>
                    <Text style={styles.subtitle}>
                        Rache, controle e pague com quem participa com você.
                    </Text>
                </View>
            </View>

            <View style={styles.quickActionsContainer}>
                <TouchableOpacity style={styles.headerActionButton} onPress={handleOpenJoinModal}>
                    <View style={styles.headerActionText}>
                        <Text style={styles.headerActionTitle}>Entrar em grupo</Text>
                        <Text style={styles.headerActionSubtitle}>Use link ou código</Text>
                    </View>
                    <View style={styles.headerActionIcon}>
                        <LogIn size={24} color="#112332" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerActionButton} onPress={handleCreateGroup}>
                    <View style={styles.headerActionText}>
                        <Text style={styles.headerActionTitle}>Criar grupo</Text>
                        <Text style={styles.headerActionSubtitle}>Comece um Racha</Text>
                    </View>
                    <View style={styles.headerActionIcon}>
                        <LayersPlus size={24} color="#2563eb" />
                    </View>
                </TouchableOpacity>
            </View>

            {groups.length > 0 ? (
                <FlatList
                    data={groups}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    renderItem={({ item }) => (
                        <GroupCard
                            title={item.title}
                            tutor={item.tutor}
                            participantsCount={item.participants}
                            color={item.color}
                            onPress={() => handleGroupPress(item)}
                        />
                    )}
                    ListFooterComponent={(
                        <View style={styles.footerActions}>
                            <TouchableOpacity style={styles.createCard} onPress={handleCreateGroup}>
                                <View style={styles.createCircle}>
                                    <LayersPlus size={28} color="#2563eb" />
                                </View>
                                <View style={styles.createTextArea}>
                                    <Text style={styles.createTitle}>Criar um novo Racha?</Text>
                                    <Text style={styles.createSubtitle}>Monte outro grupo para separar as despesas.</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.joinCard} onPress={handleOpenJoinModal}>
                                <View style={styles.joinCircle}>
                                    <Link size={26} color="#112332" />
                                </View>
                                <View style={styles.createTextArea}>
                                    <Text style={styles.joinTitle}>Entrar em um grupo</Text>
                                    <Text style={styles.joinSubtitle}>Use um link ou código enviado por um amigo.</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <EmptyState
                        icon={UsersRound}
                        title="Você ainda não participa de grupos"
                        description="Crie seu primeiro Racha para convidar pessoas, registrar despesas e acompanhar os pagamentos."
                        actionLabel="Criar meu primeiro grupo"
                        onAction={handleCreateGroup}
                    />
                    <TouchableOpacity style={styles.emptyJoinButton} onPress={handleOpenJoinModal}>
                        <LogIn size={20} color="#112332" />
                        <Text style={styles.emptyJoinButtonText}>Entrar por código</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                transparent
                visible={isJoinModalVisible}
                animationType="none"
                onRequestClose={handleCloseJoinModal}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.modalBackdrop}
                        onPress={handleCloseJoinModal}
                    />

                    <Animated.View
                        style={[
                            styles.joinModal,
                            { transform: [{ translateY: joinModalTranslateY }] },
                        ]}
                    >
                        <View style={styles.modalHandle} />

                        <View style={styles.modalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>Entrar em grupo</Text>
                                <Text style={styles.modalSubtitle}>
                                    Cole o link ou UUID de convite recebido
                                </Text>
                            </View>

                            <TouchableOpacity style={styles.closeButton} onPress={handleCloseJoinModal}>
                                <X size={22} color="#112332" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalForm}>
                            <Text style={styles.modalLabel}>Código do grupo (UUID)</Text>
                            <TextInput
                                placeholder="Ex: d3b07384-d113-4956-a57e-ee9c61b7f0de"
                                value={groupLink}
                                onChangeText={setGroupLink}
                                autoCapitalize="none"
                                editable={!joinLoading}
                                style={styles.modalInput}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={styles.cancelButton} 
                                onPress={handleCloseJoinModal}
                                disabled={joinLoading}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.enterButton} 
                                onPress={handleJoinGroupSubmit}
                                disabled={joinLoading}
                            >
                                {joinLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.enterButtonText}>Entrar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingTop: 54,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 22,
    },
    title: {
        fontFamily: 'Inter_700Bold',
        fontSize: 36,
        color: '#112332',
        flexDirection: 'row',
        alignItems: 'center',
    },
    subtitle: {
        maxWidth: 280,
        marginTop: 8,
        fontSize: 15,
        lineHeight: 22,
        color: '#5f6b76',
    },
    quickActionsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    headerActionButton: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 14,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    headerActionText: {
        flex: 1,
    },
    headerActionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#112332',
    },
    headerActionSubtitle: {
        marginTop: 2,
        fontSize: 11,
        color: '#6b7280',
    },
    headerActionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    list: {
        paddingBottom: 100,
    },
    footerActions: {
        gap: 16,
        marginTop: 24,
    },
    createCard: {
        minHeight: 120,
        borderRadius: 28,
        padding: 20,
        backgroundColor: '#112332',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    createCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    createTextArea: {
        flex: 1,
    },
    createTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    createSubtitle: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 18,
        color: '#d7dee6',
    },
    joinCard: {
        minHeight: 110,
        borderRadius: 28,
        padding: 20,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    joinCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#F2F56B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    joinTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#112332',
    },
    joinSubtitle: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 18,
        color: '#5f6b76',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60,
    },
    emptyJoinButton: {
        minHeight: 52,
        borderRadius: 26,
        paddingHorizontal: 24,
        backgroundColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: -10,
    },
    emptyJoinButtonText: {
        color: '#112332',
        fontSize: 14,
        fontWeight: '800',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    joinModal: {
        width: '100%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 34,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    modalHandle: {
        alignSelf: 'center',
        width: 40,
        height: 5,
        borderRadius: 999,
        backgroundColor: '#e2e8f0',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 22,
    },
    modalTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 26,
        color: '#112332',
    },
    modalSubtitle: {
        marginTop: 4,
        fontSize: 13,
        color: '#65717c',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalForm: {
        marginBottom: 24,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
        color: '#112332',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#f8fafc',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        minHeight: 52,
        borderRadius: 26,
        backgroundColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: '#112332',
        fontSize: 15,
        fontWeight: '800',
    },
    enterButton: {
        flex: 1,
        minHeight: 52,
        borderRadius: 26,
        backgroundColor: '#112332',
        alignItems: 'center',
        justifyContent: 'center',
    },
    enterButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
    },
});
