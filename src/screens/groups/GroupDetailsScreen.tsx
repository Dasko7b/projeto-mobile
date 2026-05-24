import { useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    ImageBackground,
    Modal,
    ScrollView,
    Share,
    TextInput,
} from 'react-native';
import { ArrowLeft, CreditCard, DollarSign, Plus, ReceiptText, Share2, UserPlus, X } from 'lucide-react-native';

type GroupData = {
    id: string;
    title: string;
    tutor: string;
    color: string;
    participants: number;
};

const friends = [
    {
        id: '1',
        name: 'Adicionar',
        add: true,
    },
    {
        id: '2',
        name: 'Adams',
        image: 'https://i.pravatar.cc/150?img=1',
    },
    {
        id: '3',
        name: 'Ross',
        image: 'https://i.pravatar.cc/150?img=2',
    },
    {
        id: '4',
        name: 'Keith',
        image: 'https://i.pravatar.cc/150?img=3',
    },
    {
        id: '5',
        name: 'Laila',
        image: 'https://i.pravatar.cc/150?img=4',
    },
];

const expenses = [
    {
        id: '1',
        title: 'Mercado',
        author: 'Matheus',
        value: 128.9,
    },
    {
        id: '2',
        title: 'Pizza',
        author: 'Thiago',
        value: 86.5,
    },
];

const historyItems = [
    {
        id: '1',
        type: 'expense',
        title: 'Mercado',
        description: 'Matheus adicionou uma despesa',
        value: 128.9,
        date: 'Hoje, 14:20',
    },
    {
        id: '2',
        type: 'payment',
        title: 'Pagamento recebido',
        description: 'Thiago pagou parte da dívida',
        value: 50,
        date: 'Hoje, 12:05',
    },
    {
        id: '3',
        type: 'expense',
        title: 'Pizza',
        description: 'Thiago adicionou uma despesa',
        value: 86.5,
        date: 'Ontem, 21:44',
    },
    {
        id: '4',
        type: 'payment',
        title: 'Pagamento recebido',
        description: 'Ross pagou parte da dívida',
        value: 72,
        date: 'Ontem, 18:10',
    },
    {
        id: '5',
        type: 'expense',
        title: 'Combustível',
        description: 'Laila adicionou uma despesa',
        value: 110,
        date: 'Sábado, 09:32',
    },
    {
        id: '6',
        type: 'expense',
        title: 'Bebidas',
        description: 'Adams adicionou uma despesa',
        value: 64.75,
        date: 'Sexta, 20:18',
    },
    {
        id: '7',
        type: 'payment',
        title: 'Pagamento recebido',
        description: 'Laila pagou parte da dívida',
        value: 45,
        date: 'Sexta, 16:02',
    },
];

export default function GroupDetailsScreen({ route, navigation }: any) {
    const group = route.params?.group as GroupData | undefined;
    const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
    const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
    const [paymentValue, setPaymentValue] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const modalTranslateY = useRef(new Animated.Value(420)).current;
    const paymentModalTranslateY = useRef(new Animated.Value(360)).current;
    const historyModalTranslateY = useRef(new Animated.Value(620)).current;
    const inviteModalTranslateY = useRef(new Animated.Value(360)).current;
    const groupCode = 'Ex93892';
    const groupName = group?.title ?? 'meu grupo';
    const totalDivida = 1000;
    const dividaAtual = 350;
    const totalPago = 650;

    function handleAddExpense() {
        setIsExpenseModalVisible(true);
        Animated.timing(modalTranslateY, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
        }).start();
    }

    function handleCloseExpenseModal() {
        Animated.timing(modalTranslateY, {
            toValue: 420,
            duration: 220,
            useNativeDriver: true,
        }).start(() => setIsExpenseModalVisible(false));
    }

    function handleOpenPaymentModal() {
        setPaymentValue('');
        setPaymentError('');
        setIsPaymentModalVisible(true);
        Animated.timing(paymentModalTranslateY, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
        }).start();
    }

    function handleClosePaymentModal() {
        Animated.timing(paymentModalTranslateY, {
            toValue: 360,
            duration: 220,
            useNativeDriver: true,
        }).start(() => {
            setIsPaymentModalVisible(false);
            setPaymentError('');
        });
    }

    function handlePaymentSubmit() {
        const normalizedValue = paymentValue.replace(',', '.');
        const paidValue = Number(normalizedValue);

        if (!paidValue || paidValue <= 0) {
            setPaymentError('Informe um valor válido para pagar.');
            return;
        }

        if (paidValue > dividaAtual) {
            setPaymentError('O valor pago não pode ser maior que o saldo devedor.');
            return;
        }

        handleClosePaymentModal();
    }

    function handleOpenHistoryModal() {
        setIsHistoryModalVisible(true);
        Animated.timing(historyModalTranslateY, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
        }).start();
    }

    function handleCloseHistoryModal() {
        Animated.timing(historyModalTranslateY, {
            toValue: 620,
            duration: 220,
            useNativeDriver: true,
        }).start(() => setIsHistoryModalVisible(false));
    }

    function handleOpenInviteModal() {
        setIsInviteModalVisible(true);
        Animated.timing(inviteModalTranslateY, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
        }).start();
    }

    function handleCloseInviteModal() {
        Animated.timing(inviteModalTranslateY, {
            toValue: 360,
            duration: 220,
            useNativeDriver: true,
        }).start(() => setIsInviteModalVisible(false));
    }

    async function handleShareInvite() {
        await Share.share({
            message: `Entre no grupo "${groupName}" no FechaConta usando o código ${groupCode}.`,
        });
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.inner}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ArrowLeft size={24} color="#112332" />
                    </TouchableOpacity>

                    <View style={styles.headerText}>
                        <Text style={styles.sectionTitle}>{group?.title ?? 'Detalhes do grupo'}</Text>
                        <Text style={styles.sectionSubtitle}>{group?.participants ?? 0} participantes</Text>
                    </View>
                </View>

                <FlatList
                    data={friends}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.memberList}
                    renderItem={({ item }) => (
                        <View style={styles.memberItem}>
                            {item.add ? (
                                <TouchableOpacity style={styles.addButton} onPress={handleOpenInviteModal}>
                                    <UserPlus size={26} color="#111" />
                                </TouchableOpacity>
                            ) : (
                                <ImageBackground
                                    source={{ uri: item.image }}
                                    style={styles.img}
                                    imageStyle={styles.avatar}
                                />
                            )}
                        <Text style={styles.memberName}>{item.name}</Text>
                    </View>
                )}
            />

                <View style={[styles.balanceCard, { backgroundColor: group?.color ?? '#f4f4f4' }]}>
                    <Text style={styles.label}>Saldo da dívida</Text>

                    <Text style={styles.value}>R$ {totalDivida.toFixed(2)}</Text>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Dívida atual</Text>
                            <Text style={styles.infoValue}>R$ {dividaAtual.toFixed(2)}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Total pago</Text>
                            <Text style={styles.infoValue}>R$ {totalPago.toFixed(2)}</Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionItem} onPress={handleAddExpense}>
                            <View style={styles.actionButton}>
                                <Plus size={22} color="#222" />
                            </View>
                            <Text style={styles.actionText}>Adicionar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} onPress={handleOpenPaymentModal}>
                            <View style={styles.actionButton}>
                                <DollarSign size={22} color="#222" />
                            </View>
                            <Text style={styles.actionText}>Pagar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} onPress={handleOpenHistoryModal}>
                            <View style={styles.actionButton}>
                                <CreditCard size={22} color="#222" />
                            </View>
                            <Text style={styles.actionText}>Histórico</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.expensesHeader}>
                    <Text style={styles.expensesTitle}>Últimas despesas</Text>
                    <ReceiptText size={22} color="#112332" />
                </View>

                <FlatList
                    data={expenses}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    contentContainerStyle={styles.expenseList}
                    renderItem={({ item }) => (
                        <View style={styles.expenseCard}>
                            <View>
                                <Text style={styles.expenseTitle}>{item.title}</Text>
                                <Text style={styles.expenseAuthor}>Adicionado por {item.author}</Text>
                            </View>
                            <Text style={styles.expenseValue}>R$ {item.value.toFixed(2)}</Text>
                        </View>
                    )}
                />
            </View>

            <Modal
                transparent
                visible={isExpenseModalVisible}
                animationType="none"
                onRequestClose={handleCloseExpenseModal}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.modalBackdrop}
                        onPress={handleCloseExpenseModal}
                    />

                    <Animated.View
                        style={[
                            styles.expenseModal,
                            { transform: [{ translateY: modalTranslateY }] },
                        ]}
                    >
                        <View style={styles.modalHandle} />

                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Adicionar despesa</Text>
                            <TouchableOpacity style={styles.closeButton} onPress={handleCloseExpenseModal}>
                                <X size={22} color="#112332" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalForm}>
                            <View>
                                <Text style={styles.modalLabel}>Título</Text>
                                <TextInput placeholder="Ex: Mercado" style={styles.modalInput} />
                            </View>

                            <View>
                                <Text style={styles.modalLabel}>Valor</Text>
                                <TextInput
                                    placeholder="R$ 0,00"
                                    keyboardType="decimal-pad"
                                    style={styles.modalInput}
                                />
                            </View>

                            <View>
                                <Text style={styles.modalLabel}>Pago por</Text>
                                <TextInput placeholder="Nome do participante" style={styles.modalInput} />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleCloseExpenseModal}>
                            <Text style={styles.saveButtonText}>Salvar despesa</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

            <Modal
                transparent
                visible={isPaymentModalVisible}
                animationType="none"
                onRequestClose={handleClosePaymentModal}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.modalBackdrop}
                        onPress={handleClosePaymentModal}
                    />

                    <Animated.View
                        style={[
                            styles.paymentModal,
                            { transform: [{ translateY: paymentModalTranslateY }] },
                        ]}
                    >
                        <View style={styles.modalHandle} />

                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Pagar dívida</Text>
                                <Text style={styles.modalSubtitle}>
                                    Saldo devedor: R$ {dividaAtual.toFixed(2)}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.closeButton} onPress={handleClosePaymentModal}>
                                <X size={22} color="#112332" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalForm}>
                            <View>
                                <Text style={styles.modalLabel}>Valor pago</Text>
                                <TextInput
                                    placeholder="R$ 0,00"
                                    keyboardType="decimal-pad"
                                    value={paymentValue}
                                    onChangeText={(value) => {
                                        setPaymentValue(value);
                                        if (paymentError) {
                                            setPaymentError('');
                                        }
                                    }}
                                    style={[
                                        styles.modalInput,
                                        paymentError ? styles.modalInputError : null,
                                    ]}
                                />
                                {paymentError ? (
                                    <Text style={styles.errorText}>{paymentError}</Text>
                                ) : null}
                            </View>
                        </View>

                        <View style={styles.paymentActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleClosePaymentModal}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.payButton} onPress={handlePaymentSubmit}>
                                <Text style={styles.payButtonText}>Pagar</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            <Modal
                transparent
                visible={isHistoryModalVisible}
                animationType="none"
                onRequestClose={handleCloseHistoryModal}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.modalBackdrop}
                        onPress={handleCloseHistoryModal}
                    />

                    <Animated.View
                        style={[
                            styles.historyModal,
                            { transform: [{ translateY: historyModalTranslateY }] },
                        ]}
                    >
                        <View style={styles.modalHandle} />

                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Histórico</Text>
                                <Text style={styles.modalSubtitle}>
                                    Movimentações recentes do grupo
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.closeButton} onPress={handleCloseHistoryModal}>
                                <X size={22} color="#112332" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={historyItems}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.historyList}
                            renderItem={({ item }) => (
                                <View style={styles.historyItem}>
                                    <View
                                        style={[
                                            styles.historyBadge,
                                            item.type === 'payment'
                                                ? styles.historyBadgePayment
                                                : styles.historyBadgeExpense,
                                        ]}
                                    >
                                        {item.type === 'payment' ? (
                                            <DollarSign size={18} color="#112332" />
                                        ) : (
                                            <ReceiptText size={18} color="#112332" />
                                        )}
                                    </View>

                                    <View style={styles.historyContent}>
                                        <Text style={styles.historyTitle}>{item.title}</Text>
                                        <Text style={styles.historyDescription}>{item.description}</Text>
                                        <Text style={styles.historyDate}>{item.date}</Text>
                                    </View>

                                    <Text
                                        style={[
                                            styles.historyValue,
                                            item.type === 'payment'
                                                ? styles.historyValuePayment
                                                : styles.historyValueExpense,
                                        ]}
                                    >
                                        {item.type === 'payment' ? '-' : '+'} R$ {item.value.toFixed(2)}
                                    </Text>
                                </View>
                            )}
                        />
                    </Animated.View>
                </View>
            </Modal>

            <Modal
                transparent
                visible={isInviteModalVisible}
                animationType="none"
                onRequestClose={handleCloseInviteModal}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.modalBackdrop}
                        onPress={handleCloseInviteModal}
                    />

                    <Animated.View
                        style={[
                            styles.inviteModal,
                            { transform: [{ translateY: inviteModalTranslateY }] },
                        ]}
                    >
                        <View style={styles.modalHandle} />

                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Convidar Amigo</Text>
                                <Text style={styles.modalSubtitle}>
                                    Compartilhe o código de acesso do grupo
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.closeButton} onPress={handleCloseInviteModal}>
                                <X size={22} color="#112332" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inviteCodeCard}>
                            <Text style={styles.inviteCodeLabel}>Código do grupo</Text>
                            <Text style={styles.inviteCode}>{groupCode}</Text>
                            <Text style={styles.inviteCodeHint}>
                                Envie este código para a pessoa entrar no grupo.
                            </Text>
                        </View>

                        <View style={styles.inviteActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCloseInviteModal}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareButton} onPress={handleShareInvite}>
                                <Share2 size={20} color="#fff" />
                                <Text style={styles.shareButtonText}>Compartilhar</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        paddingBottom: 120,
    },
    inner: {
        gap: 8,
        paddingHorizontal: 23,
        paddingTop: 54,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,
    },
    sectionTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 20,
        color: '#112332',
    },
    sectionSubtitle: {
        marginTop: 2,
        fontSize: 13,
        color: '#65717c',
    },
    img: {
        width: 60,
        height: 60,
    },
    memberList: {
        paddingVertical: 15,
        gap: 12,
        paddingLeft: 5,
    },
    memberItem: {
        width: 72,
        alignItems: 'center',
        gap: 7,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    addButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
    },
    memberName: {
        fontSize: 12,
        color: '#4c5863',
        textAlign: 'center',
    },
    inviteButton: {
        minHeight: 52,
        borderRadius: 26,
        backgroundColor: '#112332',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 10,
    },
    inviteButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
    },
    balanceCard: {
        width: '100%',
        borderRadius: 28,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 6,
    },
    label: {
        fontSize: 15,
        color: '#333',
        marginBottom: 10,
    },
    value: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#111',
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
    },
    infoBox: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: '#ddd',
        marginHorizontal: 10,
    },
    infoLabel: {
        fontSize: 13,
        color: '#777',
        marginBottom: 6,
    },
    infoValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 28,
    },
    actionItem: {
        alignItems: 'center',
        gap: 10,
    },
    actionButton: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: 'rgba(255,255,255,0.72)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 12,
        color: '#333',
    },
    expensesHeader: {
        marginTop: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    expensesTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 22,
        color: '#112332',
    },
    expenseList: {
        gap: 12,
        paddingTop: 12,
    },
    expenseCard: {
        minHeight: 76,
        borderRadius: 18,
        padding: 16,
        backgroundColor: '#f5f7f9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    expenseTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#112332',
    },
    expenseAuthor: {
        marginTop: 4,
        fontSize: 13,
        color: '#65717c',
    },
    expenseValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    expenseModal: {
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
        gap: 16,
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
    modalInputError: {
        borderColor: '#e5484d',
        backgroundColor: '#fff7f7',
    },
    errorText: {
        marginTop: 8,
        fontSize: 13,
        color: '#e5484d',
        fontWeight: '700',
    },
    saveButton: {
        minHeight: 58,
        borderRadius: 29,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    paymentModal: {
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
    paymentActions: {
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
    payButton: {
        flex: 1,
        minHeight: 56,
        borderRadius: 28,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    inviteModal: {
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
    inviteCodeCard: {
        borderRadius: 24,
        padding: 22,
        backgroundColor: '#f5f7f9',
        alignItems: 'center',
        marginBottom: 22,
    },
    inviteCodeLabel: {
        fontSize: 13,
        color: '#65717c',
        fontWeight: '700',
    },
    inviteCode: {
        marginTop: 8,
        fontSize: 42,
        fontWeight: '900',
        color: '#112332',
        letterSpacing: 1,
    },
    inviteCodeHint: {
        marginTop: 10,
        fontSize: 14,
        lineHeight: 20,
        color: '#65717c',
        textAlign: 'center',
    },
    inviteActions: {
        flexDirection: 'row',
        gap: 12,
    },
    shareButton: {
        flex: 1,
        minHeight: 56,
        borderRadius: 28,
        backgroundColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    historyModal: {
        width: '100%',
        maxHeight: '78%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 28,
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
    historyList: {
        gap: 12,
        paddingBottom: 10,
    },
    historyItem: {
        minHeight: 88,
        borderRadius: 18,
        padding: 14,
        backgroundColor: '#f5f7f9',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    historyBadge: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyBadgeExpense: {
        backgroundColor: '#AEE7F8',
    },
    historyBadgePayment: {
        backgroundColor: '#F2F56B',
    },
    historyContent: {
        flex: 1,
        gap: 3,
    },
    historyTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#112332',
    },
    historyDescription: {
        fontSize: 13,
        lineHeight: 18,
        color: '#65717c',
    },
    historyDate: {
        fontSize: 12,
        color: '#8a96a3',
    },
    historyValue: {
        fontSize: 14,
        fontWeight: '800',
    },
    historyValueExpense: {
        color: '#112332',
    },
    historyValuePayment: {
        color: '#13795b',
    },
});
