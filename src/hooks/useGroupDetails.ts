import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Platform, Share } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import {
    createExpense,
    Expense,
    getGroupDetails,
    GroupData,
    Member,
    settleGroupPayment,
    uploadReceiptImage,
} from '../services/api/groups.api';

type ReceiptImage = {
    uri: string;
    fileName?: string | null;
};

type CalculatedBalance = {
    id: string;
    name: string;
    avatar: string;
    paid: number;
    balance: number;
};

export function useGroupDetails(group?: GroupData) {
    const { user, refreshConsolidatedBalance } = useAuth();
    const currentUser = user;

    const [members, setMembers] = useState<Member[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
    const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);

    const [expenseTitle, setExpenseTitle] = useState('');
    const [expenseValue, setExpenseValue] = useState('');
    const [selectedPayerId, setSelectedPayerId] = useState(currentUser?.id ?? '');
    const [receiptImage, setReceiptImage] = useState<ReceiptImage | null>(null);
    const [expenseSaving, setExpenseSaving] = useState(false);

    const [paymentValue, setPaymentValue] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const [paymentSaving, setPaymentSaving] = useState(false);
    const [selectedReceiverId, setSelectedReceiverId] = useState('');

    const modalTranslateY = useRef(new Animated.Value(450)).current;
    const paymentModalTranslateY = useRef(new Animated.Value(360)).current;
    const historyModalTranslateY = useRef(new Animated.Value(620)).current;
    const inviteModalTranslateY = useRef(new Animated.Value(360)).current;

    async function loadGroupData() {
        if (!group || !currentUser) {
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            const { members: groupMembers, expenses: groupExpenses } = await getGroupDetails(group.id);
            setMembers(groupMembers);
            setExpenses(groupExpenses);
        } catch (err: any) {
            console.error('Erro ao carregar dados do grupo:', err);
            Alert.alert('Erro', 'Não foi possível carregar as informações do grupo.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadGroupData();
    }, [group?.id, currentUser?.id]);

    useEffect(() => {
        if (currentUser?.id) {
            setSelectedPayerId(currentUser.id);
        }
    }, [currentUser?.id]);

    function handleRefresh() {
        setRefreshing(true);
        loadGroupData();
        refreshConsolidatedBalance();
    }

    const realExpenses = expenses.filter(expense => !expense.descricao.startsWith('Liquidação'));
    const totalExpenses = realExpenses.reduce((sum, expense) => sum + expense.valor, 0);
    const numberOfMembers = members.length;
    const sharePerMember = numberOfMembers > 0 ? totalExpenses / numberOfMembers : 0;

    const realPaidPerMember: { [userId: string]: number } = {};
    const settlementsPaid: { [userId: string]: number } = {};
    const settlementsReceived: { [userId: string]: number } = {};

    members.forEach(member => {
        realPaidPerMember[member.user_id] = 0;
        settlementsPaid[member.user_id] = 0;
        settlementsReceived[member.user_id] = 0;
    });

    expenses.forEach(expense => {
        if (expense.descricao.startsWith('Liquidação')) {
            const payer = expense.paid_by;
            let receiver = '';

            if (expense.descricao.startsWith('Liquidação: para ')) {
                receiver = expense.descricao.replace('Liquidação: para ', '').trim();
            }

            if (settlementsPaid[payer] !== undefined) {
                settlementsPaid[payer] += expense.valor;
            }

            if (receiver && settlementsReceived[receiver] !== undefined) {
                settlementsReceived[receiver] += expense.valor;
            }

            return;
        }

        if (realPaidPerMember[expense.paid_by] !== undefined) {
            realPaidPerMember[expense.paid_by] += expense.valor;
        }
    });

    const calculatedBalances: CalculatedBalance[] = members.map(member => {
        const realPaid = realPaidPerMember[member.user_id] || 0;
        const settlementPaid = settlementsPaid[member.user_id] || 0;
        const settlementReceived = settlementsReceived[member.user_id] || 0;
        const balance = (realPaid - sharePerMember) + settlementPaid - settlementReceived;

        return {
            id: member.user_id,
            name: member.users?.nome || 'Membro',
            avatar: `https://i.pravatar.cc/150?u=${member.user_id}`,
            paid: realPaid,
            balance,
        };
    });

    const myBalanceItem = calculatedBalances.find(balance => balance.id === currentUser?.id);
    const myBalance = myBalanceItem ? myBalanceItem.balance : 0;
    const myPaid = myBalanceItem ? myBalanceItem.paid : 0;

    async function pickReceiptFromCamera() {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permissão necessária', 'Autorize o acesso à câmera para fotografar o recibo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setReceiptImage({
                uri: result.assets[0].uri,
                fileName: result.assets[0].fileName,
            });
        }
    }

    async function pickReceiptFromGallery() {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permissão necessária', 'Autorize o acesso à galeria para anexar o recibo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setReceiptImage({
                uri: result.assets[0].uri,
                fileName: result.assets[0].fileName,
            });
        }
    }

    function handleChooseReceiptImage() {
        if (Platform.OS === 'web') {
            pickReceiptFromGallery();
            return;
        }

        Alert.alert('Adicionar comprovante', 'Escolha como deseja anexar o recibo.', [
            { text: 'Câmera', onPress: pickReceiptFromCamera },
            { text: 'Galeria', onPress: pickReceiptFromGallery },
            { text: 'Cancelar', style: 'cancel' },
        ]);
    }

    function handleAddExpense() {
        if (!currentUser) return;

        setExpenseTitle('');
        setExpenseValue('');
        setSelectedPayerId(currentUser.id);
        setReceiptImage(null);
        setIsExpenseModalVisible(true);
        Animated.timing(modalTranslateY, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
        }).start();
    }

    function handleCloseExpenseModal() {
        if (expenseSaving) return;

        Animated.timing(modalTranslateY, {
            toValue: 450,
            duration: 220,
            useNativeDriver: true,
        }).start(() => {
            setIsExpenseModalVisible(false);
            setReceiptImage(null);
        });
    }

    async function handleExpenseSubmit() {
        if (!group) return;

        if (!expenseTitle.trim()) {
            Alert.alert('Erro', 'Por favor, informe a descrição da despesa.');
            return;
        }

        const normalizedVal = expenseValue.replace(',', '.');
        const parsedVal = Number(normalizedVal);

        if (!parsedVal || parsedVal <= 0) {
            Alert.alert('Erro', 'Por favor, informe um valor de despesa válido.');
            return;
        }

        setExpenseSaving(true);

        try {
            let receiptUrl = null;

            if (receiptImage) {
                try {
                    receiptUrl = await uploadReceiptImage(receiptImage.uri);
                } catch (uploadError) {
                    console.error('Erro no upload do comprovante:', uploadError);

                    const saveWithoutReceipt = await new Promise((resolve) => {
                        if (Platform.OS === 'web') {
                            const confirmSave = window.confirm('Erro de Upload: Não foi possível enviar o recibo. Deseja salvar a despesa assim mesmo?');
                            resolve(confirmSave);
                        } else {
                            Alert.alert(
                                'Erro de Upload',
                                'Não foi possível enviar o recibo. Deseja salvar a despesa assim mesmo?',
                                [
                                    { text: 'Cancelar', onPress: () => resolve(false), style: 'cancel' },
                                    { text: 'Sim, salvar sem recibo', onPress: () => resolve(true) },
                                ],
                            );
                        }
                    });

                    if (!saveWithoutReceipt) {
                        setExpenseSaving(false);
                        return;
                    }
                }
            }

            await createExpense({
                groupId: group.id,
                paidBy: selectedPayerId,
                value: parsedVal,
                description: expenseTitle.trim(),
                receiptUrl,
            });

            handleCloseExpenseModal();
            loadGroupData();
            refreshConsolidatedBalance();
        } catch (err: any) {
            console.error('Erro ao salvar despesa:', err);
            Alert.alert('Erro', 'Ocorreu um erro ao salvar a despesa.');
        } finally {
            setExpenseSaving(false);
        }
    }

    function handleOpenPaymentModal() {
        if (!currentUser) return;

        setPaymentValue('');
        setPaymentError('');

        const otherMembers = members.filter(member => member.user_id !== currentUser.id);
        setSelectedReceiverId(otherMembers[0]?.user_id ?? '');
        setIsPaymentModalVisible(true);

        Animated.timing(paymentModalTranslateY, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
        }).start();
    }

    function handleClosePaymentModal() {
        if (paymentSaving) return;

        Animated.timing(paymentModalTranslateY, {
            toValue: 360,
            duration: 220,
            useNativeDriver: true,
        }).start(() => {
            setIsPaymentModalVisible(false);
            setPaymentError('');
        });
    }

    async function handlePaymentSubmit() {
        if (!group || !currentUser) return;

        const normalizedValue = paymentValue.replace(',', '.');
        const paidValue = Number(normalizedValue);

        if (!paidValue || paidValue <= 0) {
            setPaymentError('Informe um valor válido.');
            return;
        }

        if (!selectedReceiverId) {
            setPaymentError('Selecione quem recebeu o pagamento.');
            return;
        }

        const maxOwed = myBalance < 0 ? Math.abs(myBalance) : 0;
        if (maxOwed > 0 && paidValue > maxOwed + 0.01) {
            setPaymentError(`Você deve no máximo R$ ${maxOwed.toFixed(2)}.`);
            return;
        }

        setPaymentSaving(true);

        try {
            await settleGroupPayment({
                groupId: group.id,
                payerId: currentUser.id,
                receiverId: selectedReceiverId,
                value: paidValue,
            });

            handleClosePaymentModal();
            loadGroupData();
            refreshConsolidatedBalance();

            if (Platform.OS === 'web') {
                window.alert('Pagamento de liquidação registrado com sucesso!');
            } else {
                Alert.alert('Sucesso', 'Pagamento de liquidação registrado com sucesso!');
            }
        } catch (err: any) {
            console.error('Erro ao registrar liquidação:', err);

            if (Platform.OS === 'web') {
                window.alert('Não foi possível registrar o pagamento.');
            } else {
                Alert.alert('Erro', 'Não foi possível registrar o pagamento.');
            }
        } finally {
            setPaymentSaving(false);
        }
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
        if (!group) return;

        try {
            await Share.share({
                message: `Entre no meu grupo "${group.title}" no FechaConta usando o código de convite abaixo:\n\n${group.id}\n\nAbra o app e insira o código em "Entrar em grupo".`,
            });
        } catch (err) {
            console.error('Erro ao compartilhar convite:', err);
        }
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return {
        currentUser,
        members,
        expenses,
        loading,
        refreshing,
        isExpenseModalVisible,
        isPaymentModalVisible,
        isHistoryModalVisible,
        isInviteModalVisible,
        expenseTitle,
        expenseValue,
        selectedPayerId,
        receiptImage,
        expenseSaving,
        paymentValue,
        paymentError,
        paymentSaving,
        selectedReceiverId,
        modalTranslateY,
        paymentModalTranslateY,
        historyModalTranslateY,
        inviteModalTranslateY,
        calculatedBalances,
        totalExpenses,
        numberOfMembers,
        myBalance,
        myPaid,
        setExpenseTitle,
        setExpenseValue,
        setSelectedPayerId,
        setReceiptImage,
        setPaymentValue,
        setPaymentError,
        setSelectedReceiverId,
        handleRefresh,
        handleChooseReceiptImage,
        handleAddExpense,
        handleCloseExpenseModal,
        handleExpenseSubmit,
        handleOpenPaymentModal,
        handleClosePaymentModal,
        handlePaymentSubmit,
        handleOpenHistoryModal,
        handleCloseHistoryModal,
        handleOpenInviteModal,
        handleCloseInviteModal,
        handleShareInvite,
        formatDate,
    };
}
