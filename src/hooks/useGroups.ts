import { useEffect, useRef, useState } from 'react';
import { Alert, Animated } from 'react-native';
import { useToast } from '../components/Toast/Toast';
import { useAuth } from '../context/AuthContext';
import { getGroups, GroupData, joinGroup } from '../services/api/groups.api';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function extractGroupId(inviteCode: string) {
    if (!inviteCode.includes('://')) {
        return inviteCode;
    }

    const parts = inviteCode.split('/');
    return parts[parts.length - 1];
}

export function useGroups(navigation: any) {
    const { user, refreshConsolidatedBalance } = useAuth();
    const { showToast } = useToast();
    const [groups, setGroups] = useState<GroupData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
    const [groupLink, setGroupLink] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);

    const joinModalTranslateY = useRef(new Animated.Value(360)).current;

    async function loadGroups() {
        if (!user) {
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            const mappedGroups = await getGroups();
            setGroups(mappedGroups);
        } catch (err: any) {
            console.error('Erro ao carregar grupos:', err);
            Alert.alert('Erro', 'Não foi possível carregar os seus grupos.');
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

    function handleRefresh() {
        setRefreshing(true);
        loadGroups();
        refreshConsolidatedBalance();
    }

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
            showToast({
                variant: 'warning',
                title: 'Informe o código',
                message: 'Por favor, digite o código ou cole o link do grupo.',
            });
            return;
        }

        const cleanedId = extractGroupId(inviteCode);

        if (!uuidRegex.test(cleanedId)) {
            showToast({
                variant: 'warning',
                title: 'Código inválido',
                message: 'O código do grupo deve ser um identificador UUID válido.',
            });
            return;
        }

        setJoinLoading(true);

        try {
            if (!user?.id) {
                showToast({
                    variant: 'destructive',
                    title: 'Sessão inválida',
                    message: 'Usuário não autenticado.',
                });
                return;
            }

            const result = await joinGroup(cleanedId, user.id);

            if (result.status === 'already-member') {
                showToast({
                    variant: 'warning',
                    title: 'Você já participa',
                    message: 'Você já faz parte deste grupo.',
                });
                return;
            }

            if (result.status === 'not-found') {
                showToast({
                    variant: 'destructive',
                    title: 'Grupo não encontrado',
                    message: 'Verifique o código e tente novamente.',
                });
                return;
            }

            showToast({
                variant: 'success',
                title: 'Você entrou no grupo',
                message: `Agora você participa de "${result.groupName}".`,
            });
            handleCloseJoinModal();
            loadGroups();
            refreshConsolidatedBalance();
        } catch (err: any) {
            console.error('Erro ao entrar no grupo:', err);
            showToast({
                variant: 'destructive',
                title: 'Erro ao entrar',
                message: 'Ocorreu um erro ao tentar se associar a este grupo.',
            });
        } finally {
            setJoinLoading(false);
        }
    }

    return {
        groups,
        loading,
        refreshing,
        isJoinModalVisible,
        groupLink,
        joinLoading,
        joinModalTranslateY,
        setGroupLink,
        handleRefresh,
        handleCreateGroup,
        handleGroupPress,
        handleOpenJoinModal,
        handleCloseJoinModal,
        handleJoinGroupSubmit,
    };
}
