import React from 'react';
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
    Text,
    TouchableOpacity,
    View,
    RefreshControl,
    ActivityIndicator,
    Modal,
    TextInput,
    Switch
} from 'react-native';
import { useProfile } from '../../hooks/useProfile';
import { styles } from '../../styles/profile/ProfileScreen.styles';

export default function ProfileScreen({ navigation }: any) {
    const {
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
    } = useProfile(navigation);
    
    if (!currentUser) {
        return null;
    }


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

                <TouchableOpacity style={styles.editButton} onPress={openEditProfileModal}>
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
                    onPress={openEditProfileModal}
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
