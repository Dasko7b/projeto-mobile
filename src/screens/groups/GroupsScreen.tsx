import { Flame, Link, LayersPlus, LogIn, UsersRound, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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
    const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
    const [groupLink, setGroupLink] = useState('');
    const joinModalTranslateY = useRef(new Animated.Value(360)).current;
    const hasGroups = groups.length > 0;

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
        });
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


            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.headerActions}
                contentContainerStyle={styles.headerActionsContent}
            >
                <TouchableOpacity style={styles.headerActionButton} onPress={handleOpenJoinModal}>
                    <View style={styles.headerActionText}>
                        <Text style={styles.headerActionTitle}>Entrar em grupo</Text>
                        <Text style={styles.headerActionSubtitle}>Use link ou codigo</Text>
                    </View>

                    <View style={styles.headerActionIcon}>
                        <LogIn size={24} color="#112332" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerActionButton} onPress={handleCreateGroup}>
                    <View style={styles.headerActionText}>
                        <Text style={styles.headerActionTitle}>Criar grupo</Text>
                        <Text style={styles.headerActionSubtitle}>Comece um novo Racha</Text>
                    </View>

                    <View style={styles.headerActionIcon}>
                        <LayersPlus size={25} color="#0044ff" fill="#0044ff" />
                    </View>
                </TouchableOpacity>
            </ScrollView>

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
                        <View style={styles.footerActions}>
                            <TouchableOpacity style={styles.createCard} onPress={handleCreateGroup}>
                                <View style={styles.createCircle}>
                                    <LayersPlus size={30} color="#0044ff" fill="#0044ff" />
                                </View>
                                <View style={styles.createTextArea}>
                                    <Text style={styles.createTitle}>Criar um novo Racha?</Text>
                                    <Text style={styles.createSubtitle}>Monte outro grupo para separar as despesas.</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.joinCard} onPress={handleOpenJoinModal}>
                                <View style={styles.joinCircle}>
                                    <Link size={28} color="#112332" />
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
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <UsersRound size={44} color="#112332" />
                    </View>

                    <Text style={styles.emptyTitle}>Você ainda não participa de grupos</Text>
                    <Text style={styles.emptyText}>
                        Crie seu primeiro Racha para convidar pessoas, registrar despesas e acompanhar os pagamentos.
                    </Text>

                    <View style={styles.emptyActions}>
                        <TouchableOpacity style={styles.emptyButton} onPress={handleCreateGroup}>
                            <LayersPlus size={24} color="#fff" />
                            <Text style={styles.emptyButtonText}>Criar grupo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.emptyJoinButton} onPress={handleOpenJoinModal}>
                            <LogIn size={22} color="#112332" />
                            <Text style={styles.emptyJoinButtonText}>Entrar por link</Text>
                        </TouchableOpacity>
                    </View>
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
                            <View>
                                <Text style={styles.modalTitle}>Entrar em grupo</Text>
                                <Text style={styles.modalSubtitle}>
                                    Cole o link ou código de convite recebido
                                </Text>
                            </View>

                            <TouchableOpacity style={styles.closeButton} onPress={handleCloseJoinModal}>
                                <X size={22} color="#112332" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalForm}>
                            <Text style={styles.modalLabel}>Link ou código</Text>
                            <TextInput
                                placeholder="Ex: Ex93892 ou fechaconta://grupo/Ex93892"
                                value={groupLink}
                                onChangeText={setGroupLink}
                                autoCapitalize="none"
                                style={styles.modalInput}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCloseJoinModal}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.enterButton} onPress={handleCloseJoinModal}>
                                <Text style={styles.enterButtonText}>Entrar</Text>
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
    headerActions: {
        marginHorizontal: -24,
        marginBottom: 20,
    },
    headerActionsContent: {
        gap: 12,
        paddingHorizontal: 24,
        paddingBottom: 80,
    },
    headerActionButton: {
        flexDirection: 'row',
        width: 240,
        minHeight: 78,
        borderRadius: 20,
        paddingHorizontal: 16,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    headerActionText: {
        flex: 1,
    },
    headerActionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#112332',
    },
    headerActionSubtitle: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 18,
        color: '#5f6b76',
    },
    headerActionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        gap: 20,
        paddingBottom: 120,
    },
    footerActions: {
        gap: 16,
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
    joinCard: {
        minHeight: 116,
        borderRadius: 28,
        padding: 20,
        backgroundColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
    },
    joinCircle: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: '#F2F56B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    joinTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#112332',
    },
    joinSubtitle: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
        color: '#5f6b76',
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
    emptyActions: {
        width: '100%',
        gap: 12,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    emptyJoinButton: {
        minHeight: 56,
        borderRadius: 28,
        backgroundColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    emptyJoinButtonText: {
        color: '#112332',
        fontSize: 16,
        fontWeight: '800',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
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
        shadowOffset: {
            width: 0,
            height: -6,
        },
        shadowOpacity: 0.14,
        shadowRadius: 16,
        elevation: 12,
    },
    modalHandle: {
        alignSelf: 'center',
        width: 46,
        height: 5,
        borderRadius: 999,
        backgroundColor: '#d8e0e8',
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
        fontSize: 28,
        color: '#112332',
    },
    modalSubtitle: {
        marginTop: 4,
        fontSize: 14,
        color: '#65717c',
    },
    closeButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalForm: {
        marginBottom: 24,
    },
    modalLabel: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 10,
        color: '#112332',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#d8e0e8',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#f8fafc',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        minHeight: 56,
        borderRadius: 28,
        backgroundColor: '#eef2f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: '#112332',
        fontSize: 16,
        fontWeight: '800',
    },
    enterButton: {
        flex: 1,
        minHeight: 56,
        borderRadius: 28,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    enterButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
});
