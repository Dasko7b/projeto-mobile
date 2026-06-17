import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
    getProfileStats,
    ProfileStats,
    updateProfileName,
    updateProfilePassword,
} from '../services/api/profile.api';

export function useProfile(navigation: any) {
    const {
        user,
        signOut,
        consolidatedBalance,
        refreshConsolidatedBalance,
        fetchUserProfile,
        session,
    } = useAuth();

    const currentUser = user;

    const [stats, setStats] = useState<ProfileStats>({ groupsCount: 0, totalPaid: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editName, setEditName] = useState(currentUser?.nome ?? '');
    const [savingProfile, setSavingProfile] = useState(false);

    const [isPaymentsModalVisible, setIsPaymentsModalVisible] = useState(false);
    const [pixKey, setPixKey] = useState('');
    const [savingPayments, setSavingPayments] = useState(false);

    const [isNotificationsModalVisible, setIsNotificationsModalVisible] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);

    const [isSecurityModalVisible, setIsSecurityModalVisible] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingSecurity, setSavingSecurity] = useState(false);

    async function loadStats() {
        if (!currentUser) {
            setLoadingStats(false);
            setRefreshing(false);
            return;
        }

        try {
            const profileStats = await getProfileStats(currentUser.id);
            setStats(profileStats);
        } catch (err) {
            console.error('Erro ao carregar estatisticas:', err);
        } finally {
            setLoadingStats(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        if (!currentUser) {
            setLoadingStats(false);
            return;
        }

        loadStats();
        refreshConsolidatedBalance();

        const unsubscribe = navigation?.addListener('focus', () => {
            loadStats();
            refreshConsolidatedBalance();
        });

        return unsubscribe;
    }, [navigation, currentUser?.id]);

    useEffect(() => {
        setEditName(currentUser?.nome ?? '');
    }, [currentUser?.nome]);

    async function handleRefresh() {
        setRefreshing(true);
        await Promise.all([
            loadStats(),
            refreshConsolidatedBalance(),
        ]);
    }

    function openEditProfileModal() {
        if (!currentUser) return;

        setEditName(currentUser.nome);
        setIsEditModalVisible(true);
    }

    function handleLogout() {
        if (Platform.OS === 'web') {
            const confirmLogout = window.confirm('Deseja realmente sair da sua conta?');
            if (confirmLogout) {
                signOut();
            }
            return;
        }

        Alert.alert(
            'Sair',
            'Deseja realmente sair da sua conta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', onPress: signOut, style: 'destructive' },
            ],
        );
    }

    async function handleSaveProfile() {
        if (!currentUser) return;

        if (!editName.trim()) {
            if (Platform.OS === 'web') {
                window.alert('Por favor, preencha o nome.');
            } else {
                Alert.alert('Erro', 'Por favor, preencha o nome.');
            }
            return;
        }

        setSavingProfile(true);

        try {
            await updateProfileName(currentUser.id, editName);

            if (session?.user) {
                await fetchUserProfile(session.user);
            }

            setIsEditModalVisible(false);

            if (Platform.OS === 'web') {
                window.alert('Perfil atualizado com sucesso!');
            } else {
                Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
            }
        } catch (err: any) {
            console.error('Erro ao salvar perfil:', err);
            if (Platform.OS === 'web') {
                window.alert('Erro ao salvar perfil: ' + err.message);
            } else {
                Alert.alert('Erro', err.message || 'Erro desconhecido.');
            }
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleSaveSecurity() {
        if (newPassword.length < 6) {
            const msg = 'A senha deve ter pelo menos 6 caracteres.';
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert('Erro', msg);
            return;
        }

        if (newPassword !== confirmPassword) {
            const msg = 'As senhas nao coincidem.';
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert('Erro', msg);
            return;
        }

        setSavingSecurity(true);

        try {
            await updateProfilePassword(newPassword);

            setIsSecurityModalVisible(false);
            setNewPassword('');
            setConfirmPassword('');

            const successMsg = 'Sua senha foi atualizada com sucesso!';
            if (Platform.OS === 'web') window.alert(successMsg);
            else Alert.alert('Sucesso', successMsg);
        } catch (err: any) {
            console.error('Erro ao alterar senha:', err);
            if (Platform.OS === 'web') window.alert(err.message);
            else Alert.alert('Erro ao alterar senha', err.message || 'Tente novamente.');
        } finally {
            setSavingSecurity(false);
        }
    }

    function handleSavePayments() {
        setSavingPayments(true);
        setTimeout(() => {
            setSavingPayments(false);
            setIsPaymentsModalVisible(false);

            const msg = 'Chave PIX preferencial salva com sucesso!';
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert('Sucesso', msg);
        }, 600);
    }

    const balanceColor = consolidatedBalance > 0
        ? { bg: '#dcfce7', iconBg: '#bbf7d0', text: '#16a34a' }
        : consolidatedBalance < 0
            ? { bg: '#fee2e2', iconBg: '#fecaca', text: '#dc2626' }
            : { bg: '#f1f5f9', iconBg: '#e2e8f0', text: '#64748b' };

    return {
        currentUser,
        consolidatedBalance,
        stats,
        loadingStats,
        refreshing,
        isEditModalVisible,
        editName,
        savingProfile,
        isPaymentsModalVisible,
        pixKey,
        savingPayments,
        isNotificationsModalVisible,
        emailNotifications,
        pushNotifications,
        isSecurityModalVisible,
        newPassword,
        confirmPassword,
        savingSecurity,
        balanceColor,
        setIsEditModalVisible,
        setEditName,
        setIsPaymentsModalVisible,
        setPixKey,
        setIsNotificationsModalVisible,
        setEmailNotifications,
        setPushNotifications,
        setIsSecurityModalVisible,
        setNewPassword,
        setConfirmPassword,
        handleRefresh,
        openEditProfileModal,
        handleLogout,
        handleSaveProfile,
        handleSaveSecurity,
        handleSavePayments,
    };
}
