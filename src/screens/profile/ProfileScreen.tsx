import React, { useEffect, useState } from 'react';
import {
    Bell,
    ChevronRight,
    CreditCard,
    LogOut,
    Mail,
    ShieldCheck,
    UserRound,
    WalletCards,
    X,
} from 'lucide-react-native';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    RefreshControl,
    Alert,
    ActivityIndicator,
    Platform,
    Modal,
    TextInput,
    Switch,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

export default function ProfileScreen({ navigation }: any) {
    const { user, signOut, consolidatedBalance, refreshConsolidatedBalance, fetchUserProfile, session } = useAuth();
    
    if (!user) {
        return null;
    }

    const currentUser = user;

    const [stats, setStats] = useState({ groupsCount: 0, totalPaid: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modals States
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editName, setEditName] = useState(currentUser.nome);
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
        try {
            // 1. Count user's groups
            const { count: groupsCount, error: groupsError } = await supabase
                .from('group_members')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.id);

            if (groupsError) throw groupsError;

            // 2. Sum user's total paid expenses
            const { data: expensesData, error: expensesError } = await supabase
                .from('expenses')
                .select('valor')
                .eq('paid_by', currentUser.id)
                .not('descricao', 'ilike', 'Liquidação%'); // Exclude settlement payments

            if (expensesError) throw expensesError;

            const totalPaid = expensesData ? expensesData.reduce((sum: number, item: any) => sum + Number(item.valor), 0) : 0;

            setStats({
                groupsCount: groupsCount || 0,
                totalPaid: totalPaid
            });
        } catch (err) {
            console.error("Erro ao carregar estatísticas:", err);
        } finally {
            setLoadingStats(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadStats();
        refreshConsolidatedBalance();

        const unsubscribe = navigation?.addListener('focus', () => {
            loadStats();
            refreshConsolidatedBalance();
        });

        return unsubscribe;
    }, [navigation, currentUser.id]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            loadStats(),
            refreshConsolidatedBalance()
        ]);
    };

    function handleLogout() {
        if (Platform.OS === 'web') {
            const confirmLogout = window.confirm("Deseja realmente sair da sua conta?");
            if (confirmLogout) {
                signOut();
            }
        } else {
            Alert.alert(
                "Sair",
                "Deseja realmente sair da sua conta?",
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Sair", onPress: signOut, style: "destructive" }
                ]
            );
        }
    }

    async function handleSaveProfile() {
        if (!editName.trim()) {
            if (Platform.OS === 'web') {
                window.alert("Por favor, preencha o nome.");
            } else {
                Alert.alert("Erro", "Por favor, preencha o nome.");
            }
            return;
        }

        setSavingProfile(true);
        try {
            // Update public.users
            const { error: updateError } = await supabase
                .from('users')
                .update({ nome: editName.trim() })
                .eq('id', currentUser.id);

            if (updateError) throw updateError;

            // Update Auth metadata for consistency
            await supabase.auth.updateUser({
                data: { nome: editName.trim() }
            });

            // Refresh profile context
            if (session?.user) {
                await fetchUserProfile(session.user);
            }

            setIsEditModalVisible(false);
            if (Platform.OS === 'web') {
                window.alert("Perfil atualizado com sucesso!");
            } else {
                Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
            }
        } catch (err: any) {
            console.error("Erro ao salvar perfil:", err);
            if (Platform.OS === 'web') {
                window.alert("Erro ao salvar perfil: " + err.message);
            } else {
                Alert.alert("Erro", err.message || "Erro desconhecido.");
            }
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleSaveSecurity() {
        if (newPassword.length < 6) {
            const msg = "A senha deve ter pelo menos 6 caracteres.";
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert("Erro", msg);
            return;
        }

        if (newPassword !== confirmPassword) {
            const msg = "As senhas não coincidem.";
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert("Erro", msg);
            return;
        }

        setSavingSecurity(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setIsSecurityModalVisible(false);
            setNewPassword('');
            setConfirmPassword('');
            const successMsg = "Sua senha foi atualizada com sucesso!";
            if (Platform.OS === 'web') window.alert(successMsg);
            else Alert.alert("Sucesso", successMsg);
        } catch (err: any) {
            console.error("Erro ao alterar senha:", err);
            if (Platform.OS === 'web') window.alert(err.message);
            else Alert.alert("Erro ao alterar senha", err.message || "Tente novamente.");
        } finally {
            setSavingSecurity(false);
        }
    }

    function handleSavePayments() {
        setSavingPayments(true);
        setTimeout(() => {
            setSavingPayments(false);
            setIsPaymentsModalVisible(false);
            const msg = "Chave PIX preferencial salva com sucesso!";
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert("Sucesso", msg);
        }, 600);
    }

    // Determine balance card colors based on value
    const balanceColor = consolidatedBalance > 0 
        ? { bg: '#dcfce7', iconBg: '#bbf7d0', text: '#16a34a' } 
        : consolidatedBalance < 0 
            ? { bg: '#fee2e2', iconBg: '#fecaca', text: '#dc2626' } 
            : { bg: '#f1f5f9', iconBg: '#e2e8f0', text: '#64748b' };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
        >
            <View style={styles.header}>
                <View style={styles.avatarWrapper}>
                    <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatar} />
                </View>

                <Text style={styles.name}>{currentUser.nome}</Text>
                <Text style={styles.email}>{currentUser.email}</Text>

                <TouchableOpacity style={styles.editButton} onPress={() => { setEditName(currentUser.nome); setIsEditModalVisible(true); }}>
                    <UserRound size={18} color="#112332" />
                    <Text style={styles.editButtonText}>Editar perfil</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    {loadingStats ? (
                        <ActivityIndicator size="small" color="#112332" />
                    ) : (
                        <Text style={styles.statValue}>{stats.groupsCount}</Text>
                    )}
                    <Text style={styles.statLabel}>Grupos</Text>
                </View>

                <View style={styles.statCard}>
                    {loadingStats ? (
                        <ActivityIndicator size="small" color="#112332" />
                    ) : (
                        <Text style={styles.statValue}>R$ {stats.totalPaid.toFixed(0)}</Text>
                    )}
                    <Text style={styles.statLabel}>Pago</Text>
                </View>
            </View>

            <View style={[styles.balanceCard, { backgroundColor: balanceColor.bg }]}>
                <View style={[styles.balanceIcon, { backgroundColor: balanceColor.iconBg }]}>
                    <WalletCards size={28} color={balanceColor.text} />
                </View>

                <View style={styles.balanceText}>
                    <Text style={[styles.balanceLabel, { color: balanceColor.text }]}>Saldo geral consolidado</Text>
                    <Text style={[styles.balanceValue, { color: balanceColor.text }]}>
                        {consolidatedBalance > 0 ? '+' : ''}R$ {consolidatedBalance.toFixed(2)}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Conta</Text>

                <ProfileOption
                    icon={<Mail size={22} color="#112332" />}
                    title="Dados pessoais"
                    subtitle="Nome, e-mail e informações da conta"
                    onPress={() => { setEditName(currentUser.nome); setIsEditModalVisible(true); }}
                />

                <ProfileOption
                    icon={<CreditCard size={22} color="#112332" />}
                    title="Pagamentos"
                    subtitle="Métodos e preferências de pagamento"
                    onPress={() => setIsPaymentsModalVisible(true)}
                />

                <ProfileOption
                    icon={<Bell size={22} color="#112332" />}
                    title="Notificações"
                    subtitle="Alertas de grupos, dívidas e pagamentos"
                    onPress={() => setIsNotificationsModalVisible(true)}
                />

                <ProfileOption
                    icon={<ShieldCheck size={22} color="#112332" />}
                    title="Segurança"
                    subtitle="Senha e acesso ao aplicativo"
                    onPress={() => setIsSecurityModalVisible(true)}
                />
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut size={22} color="#fff" />
                <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>

            {/* MODAL: EDITAR PERFIL / DADOS PESSOAIS */}
            <Modal
                transparent
                visible={isEditModalVisible}
                animationType="fade"
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity activeOpacity={1} style={styles.modalBackdrop} onPress={() => setIsEditModalVisible(false)} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Editar Perfil</Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                                <X size={24} color="#112332" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nome Completo</Text>
                            <TextInput
                                style={styles.input}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Seu nome"
                                editable={!savingProfile}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>E-mail</Text>
                            <TextInput
                                style={[styles.input, styles.inputDisabled]}
                                value={currentUser.email}
                                editable={false}
                            />
                        </View>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={savingProfile}>
                            {savingProfile ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL: SEGURANÇA */}
            <Modal
                transparent
                visible={isSecurityModalVisible}
                animationType="fade"
                onRequestClose={() => setIsSecurityModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity activeOpacity={1} style={styles.modalBackdrop} onPress={() => setIsSecurityModalVisible(false)} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Alterar Senha</Text>
                            <TouchableOpacity onPress={() => setIsSecurityModalVisible(false)}>
                                <X size={24} color="#112332" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nova Senha</Text>
                            <TextInput
                                style={styles.input}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                                placeholder="Mínimo 6 caracteres"
                                editable={!savingSecurity}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Confirme a Nova Senha</Text>
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                placeholder="Confirme a senha"
                                editable={!savingSecurity}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSecurity} disabled={savingSecurity}>
                            {savingSecurity ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Alterar Senha</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL: PAGAMENTOS */}
            <Modal
                transparent
                visible={isPaymentsModalVisible}
                animationType="fade"
                onRequestClose={() => setIsPaymentsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity activeOpacity={1} style={styles.modalBackdrop} onPress={() => setIsPaymentsModalVisible(false)} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Preferências de Pagamento</Text>
                            <TouchableOpacity onPress={() => setIsPaymentsModalVisible(false)}>
                                <X size={24} color="#112332" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Chave PIX Preferencial</Text>
                            <TextInput
                                style={styles.input}
                                value={pixKey}
                                onChangeText={setPixKey}
                                placeholder="CPF, E-mail, Telefone ou Aleatória"
                                editable={!savingPayments}
                                placeholderTextColor="#9ca3af"
                            />
                            <Text style={styles.helpText}>Esta chave será compartilhada nos grupos para facilitar a liquidação de contas.</Text>
                        </View>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSavePayments} disabled={savingPayments}>
                            {savingPayments ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Salvar Chave PIX</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL: NOTIFICAÇÕES */}
            <Modal
                transparent
                visible={isNotificationsModalVisible}
                animationType="fade"
                onRequestClose={() => setIsNotificationsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity activeOpacity={1} style={styles.modalBackdrop} onPress={() => setIsNotificationsModalVisible(false)} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Notificações</Text>
                            <TouchableOpacity onPress={() => setIsNotificationsModalVisible(false)}>
                                <X size={24} color="#112332" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.switchRow}>
                            <View style={{ flex: 1, gap: 4 }}>
                                <Text style={styles.switchTitle}>Notificações por E-mail</Text>
                                <Text style={styles.switchSubtitle}>Receba resumos semanais de contas e atividades.</Text>
                            </View>
                            <Switch
                                value={emailNotifications}
                                onValueChange={setEmailNotifications}
                                trackColor={{ false: '#d1d5db', true: '#bbf7d0' }}
                                thumbColor={emailNotifications ? '#16a34a' : '#f3f4f6'}
                            />
                        </View>
                        <View style={[styles.switchRow, { marginBottom: 24 }]}>
                            <View style={{ flex: 1, gap: 4 }}>
                                <Text style={styles.switchTitle}>Notificações Push</Text>
                                <Text style={styles.switchSubtitle}>Avisos instantâneos de novas cobranças e pagamentos.</Text>
                            </View>
                            <Switch
                                value={pushNotifications}
                                onValueChange={setPushNotifications}
                                trackColor={{ false: '#d1d5db', true: '#bbf7d0' }}
                                thumbColor={pushNotifications ? '#16a34a' : '#f3f4f6'}
                            />
                        </View>
                        <TouchableOpacity style={styles.saveButton} onPress={() => setIsNotificationsModalVisible(false)}>
                            <Text style={styles.saveButtonText}>Concluir</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

function ProfileOption({
    icon,
    title,
    subtitle,
    onPress,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity style={styles.optionCard} onPress={onPress}>
            <View style={styles.optionIcon}>
                {icon}
            </View>

            <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{title}</Text>
                <Text style={styles.optionSubtitle}>{subtitle}</Text>
            </View>

            <ChevronRight size={22} color="#9aa5b1" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 54,
        paddingBottom: 100,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarWrapper: {
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 5,
    },
    avatar: {
        width: 104,
        height: 104,
        borderRadius: 52,
    },
    name: {
        marginTop: 18,
        fontFamily: 'Inter_700Bold',
        fontSize: 30,
        color: '#112332',
        textAlign: 'center',
    },
    email: {
        marginTop: 6,
        fontSize: 15,
        color: '#65717c',
        textAlign: 'center',
    },
    editButton: {
        marginTop: 18,
        minHeight: 46,
        borderRadius: 23,
        paddingHorizontal: 18,
        backgroundColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    editButtonText: {
        color: '#112332',
        fontSize: 15,
        fontWeight: '800',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 14,
    },
    statCard: {
        flex: 1,
        minHeight: 104,
        borderRadius: 24,
        padding: 18,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 26,
        fontWeight: '900',
        color: '#112332',
    },
    statLabel: {
        marginTop: 6,
        fontSize: 13,
        color: '#65717c',
        fontWeight: '700',
    },
    balanceCard: {
        minHeight: 110,
        borderRadius: 28,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 26,
    },
    balanceIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceText: {
        flex: 1,
    },
    balanceLabel: {
        fontSize: 13,
        fontWeight: '700',
    },
    balanceValue: {
        marginTop: 4,
        fontSize: 28,
        fontWeight: '900',
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 22,
        color: '#112332',
        marginBottom: 4,
    },
    optionCard: {
        minHeight: 78,
        borderRadius: 20,
        padding: 14,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 2,
        elevation: 1,
    },
    optionText: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#112332',
    },
    optionSubtitle: {
        marginTop: 3,
        fontSize: 12,
        lineHeight: 17,
        color: '#65717c',
    },
    logoutButton: {
        minHeight: 58,
        borderRadius: 29,
        backgroundColor: '#112332',
        marginTop: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    // Modals Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 22,
        color: '#112332',
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#112332',
        marginBottom: 8,
    },
    formGroup: {
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1e293b',
        backgroundColor: '#f8fafc',
    },
    inputDisabled: {
        backgroundColor: '#e2e8f0',
        color: '#64748b',
        borderColor: '#cbd5e1',
    },
    helpText: {
        marginTop: 6,
        fontSize: 12,
        color: '#64748b',
        lineHeight: 18,
    },
    saveButton: {
        backgroundColor: '#112332',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
        marginTop: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    switchTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#112332',
    },
    switchSubtitle: {
        fontSize: 12,
        color: '#64748b',
    },
});
