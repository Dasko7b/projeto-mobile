import React from 'react';
import {
    Animated,
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { Flame, LogIn, LayersPlus, Link, X, UsersRound } from 'lucide-react-native';
import GroupCard from '../../components/GroupCard/GroupCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import { styles } from '../../styles/groups/GroupsScreen.styles';
import { useGroups } from '../../hooks/useGroups';

export default function GroupsScreen({ navigation }: any) {
    const {
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
    } = useGroups(navigation);

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
