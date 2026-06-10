import React, { useRef, useState, useEffect } from 'react';
import {
    Animated,
    Alert,
    Image,
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
    ActivityIndicator,
    RefreshControl,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, CreditCard, DollarSign, Image as ImageIcon, Plus, ReceiptText, Share2, Trash2, UserPlus, X } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading/Loading';
import ExpenseCard from '../../components/ExpenseCard/ExpenseCard';

type GroupData = {
    id: string;
    title: string;
    tutor: string;
    color: string;
    participants: number;
};

type Member = {
    user_id: string;
    users: {
        id: string;
        nome: string;
        email: string;
    };
};

type Expense = {
    id: string;
    descricao: string;
    valor: number;
    paid_by: string;
    receipt_url: string | null;
    created_at: string;
    users?: {
        nome: string;
    };
};

type ReceiptImage = {
    uri: string;
    fileName?: string | null;
};

export default function GroupDetailsScreen({ route, navigation }: any) {
    const group = route.params?.group as GroupData;
    const { user, refreshConsolidatedBalance } = useAuth();

    if (!group || !user) {
        return <Loading />;
    }

    const currentUser = user;

    const [members, setMembers] = useState<Member[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal States
    const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
    const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);

    // Expense Form States
    const [expenseTitle, setExpenseTitle] = useState('');
    const [expenseValue, setExpenseValue] = useState('');
    const [selectedPayerId, setSelectedPayerId] = useState(currentUser.id);
    const [receiptImage, setReceiptImage] = useState<ReceiptImage | null>(null);
    const [expenseSaving, setExpenseSaving] = useState(false);

    // Payment Form States
    const [paymentValue, setPaymentValue] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const [paymentSaving, setPaymentSaving] = useState(false);
    const [selectedReceiverId, setSelectedReceiverId] = useState<string>('');

    // Animations
    const modalTranslateY = useRef(new Animated.Value(450)).current;
    const paymentModalTranslateY = useRef(new Animated.Value(360)).current;
    const historyModalTranslateY = useRef(new Animated.Value(620)).current;
    const inviteModalTranslateY = useRef(new Animated.Value(360)).current;

    // Load Data
    async function loadGroupData() {
        try {
            // 1. Fetch group members
            const { data: membersData, error: membersError } = await supabase
                .from('group_members')
                .select('user_id, users ( id, nome, email )')
                .eq('group_id', group.id);

            if (membersError) throw membersError;
            
            if (membersData) {
                const formattedMembers: Member[] = membersData.map((m: any) => ({
                    user_id: m.user_id,
                    users: Array.isArray(m.users) ? m.users[0] : m.users
                }));
                setMembers(formattedMembers);
            } else {
                setMembers([]);
            }

            // 2. Fetch expenses
            const { data: expensesData, error: expensesError } = await supabase
                .from('expenses')
                .select('*, users:paid_by ( nome )')
                .eq('group_id', group.id)
                .order('created_at', { ascending: false });

            if (expensesError) {
                // Fallback query if relationship naming is different
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('expenses')
                    .select('*')
                    .eq('group_id', group.id)
                    .order('created_at', { ascending: false });
                
                if (fallbackError) throw fallbackError;
                
                // Fetch user profiles separately
                const { data: usersData } = await supabase.from('users').select('id, nome');
                const userMap = new Map(usersData?.map((u: any) => [u.id, u.nome]) || []);
                
                const mapped: Expense[] = (fallbackData || []).map((exp: any) => ({
                    ...exp,
                    valor: Number(exp.valor),
                    users: { nome: userMap.get(exp.paid_by) || 'Membro' }
                }));
                setExpenses(mapped);
            } else {
                const mapped: Expense[] = (expensesData || []).map((exp: any) => ({
                    ...exp,
                    valor: Number(exp.valor)
                }));
                setExpenses(mapped);
            }
        } catch (err: any) {
            console.error("Erro ao carregar dados do grupo:", err);
            Alert.alert("Erro", "Não foi possível carregar as informações do grupo.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadGroupData();
    }, [group.id]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadGroupData();
        refreshConsolidatedBalance();
    };

    // Calculate Balances
    const realExpenses = expenses.filter(exp => !exp.descricao.startsWith('Liquidação'));
    const totalExpenses = realExpenses.reduce((sum, exp) => sum + exp.valor, 0);
    const numberOfMembers = members.length;
    const sharePerMember = numberOfMembers > 0 ? totalExpenses / numberOfMembers : 0;

    const realPaidPerMember: { [userId: string]: number } = {};
    const settlementsPaid: { [userId: string]: number } = {};
    const settlementsReceived: { [userId: string]: number } = {};

    members.forEach(m => { 
        realPaidPerMember[m.user_id] = 0;
        settlementsPaid[m.user_id] = 0;
        settlementsReceived[m.user_id] = 0;
    });

    expenses.forEach(exp => {
        if (exp.descricao.startsWith('Liquidação')) {
            const payer = exp.paid_by;
            let receiver = '';
            if (exp.descricao.startsWith('Liquidação: para ')) {
                receiver = exp.descricao.replace('Liquidação: para ', '').trim();
            }

            if (settlementsPaid[payer] !== undefined) {
                settlementsPaid[payer] += exp.valor;
            }
            if (receiver && settlementsReceived[receiver] !== undefined) {
                settlementsReceived[receiver] += exp.valor;
            }
        } else {
            if (realPaidPerMember[exp.paid_by] !== undefined) {
                realPaidPerMember[exp.paid_by] += exp.valor;
            }
        }
    });

    const calculatedBalances = members.map(m => {
        const realPaid = realPaidPerMember[m.user_id] || 0;
        const sPaid = settlementsPaid[m.user_id] || 0;
        const sReceived = settlementsReceived[m.user_id] || 0;
        const balance = (realPaid - sharePerMember) + sPaid - sReceived;
        return {
            id: m.user_id,
            name: m.users?.nome || 'Membro',
            avatar: `https://i.pravatar.cc/150?u=${m.user_id}`,
            paid: realPaid,
            balance: balance
        };
    });

    const myBalanceItem = calculatedBalances.find(b => b.id === currentUser.id);
    const myBalance = myBalanceItem ? myBalanceItem.balance : 0;
    const myPaid = myBalanceItem ? myBalanceItem.paid : 0;

    // Image Picker Flow
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
        } else {
            Alert.alert('Adicionar comprovante', 'Escolha como deseja anexar o recibo.', [
                { text: 'Câmera', onPress: pickReceiptFromCamera },
                { text: 'Galeria', onPress: pickReceiptFromGallery },
                { text: 'Cancelar', style: 'cancel' },
            ]);
        }
    }

    // Upload Image to Supabase Storage
    async function uploadReceiptImage(uri: string): Promise<string | null> {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            
            const fileExt = uri.split('.').pop() || 'jpg';
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
            const filePath = `receipts/${fileName}`;

            // Upload
            const { data, error } = await supabase.storage
                .from('receipts')
                .upload(filePath, blob, {
                    contentType: 'image/jpeg'
                });

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('receipts')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (err: any) {
            console.error("Erro no upload do comprovante:", err);
            return null;
        }
    }

    // Modal Actions
    function handleAddExpense() {
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
        if (!expenseTitle.trim()) {
            Alert.alert("Erro", "Por favor, informe a descrição da despesa.");
            return;
        }

        const normalizedVal = expenseValue.replace(',', '.');
        const parsedVal = Number(normalizedVal);
        if (!parsedVal || parsedVal <= 0) {
            Alert.alert("Erro", "Por favor, informe um valor de despesa válido.");
            return;
        }

        setExpenseSaving(true);
        try {
            let receiptUrl = null;
            if (receiptImage) {
                receiptUrl = await uploadReceiptImage(receiptImage.uri);
                if (!receiptUrl) {
                    const saveWithoutReceipt = await new Promise((resolve) => {
                        if (Platform.OS === 'web') {
                            const confirmSave = window.confirm("Erro de Upload: Não foi possível enviar o recibo. Deseja salvar a despesa assim mesmo?");
                            resolve(confirmSave);
                        } else {
                            Alert.alert(
                                "Erro de Upload",
                                "Não foi possível enviar o recibo. Deseja salvar a despesa assim mesmo?",
                                [
                                    { text: "Cancelar", onPress: () => resolve(false), style: "cancel" },
                                    { text: "Sim, salvar sem recibo", onPress: () => resolve(true) }
                                ]
                            );
                        }
                    });
                    if (!saveWithoutReceipt) {
                        setExpenseSaving(false);
                        return;
                    }
                }
            }

            // Insert Expense
            const { error } = await supabase
                .from('expenses')
                .insert({
                    group_id: group.id,
                    paid_by: selectedPayerId,
                    valor: parsedVal,
                    descricao: expenseTitle.trim(),
                    receipt_url: receiptUrl
                });

            if (error) throw error;

            handleCloseExpenseModal();
            loadGroupData();
            refreshConsolidatedBalance();
        } catch (err: any) {
            console.error("Erro ao salvar despesa:", err);
            Alert.alert("Erro", "Ocorreu um erro ao salvar a despesa.");
        } finally {
            setExpenseSaving(false);
        }
    }

    // Payment/Settle Flow
    function handleOpenPaymentModal() {
        setPaymentValue('');
        setPaymentError('');
        const otherMembers = members.filter(m => m.user_id !== currentUser.id);
        if (otherMembers.length > 0) {
            setSelectedReceiverId(otherMembers[0].user_id);
        } else {
            setSelectedReceiverId('');
        }
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
            // Settle payment is recorded as an expense with special description containing the receiver ID
            const { error } = await supabase
                .from('expenses')
                .insert({
                    group_id: group.id,
                    paid_by: currentUser.id,
                    valor: paidValue,
                    descricao: `Liquidação: para ${selectedReceiverId}`,
                    receipt_url: null
                });

            if (error) throw error;

            handleClosePaymentModal();
            loadGroupData();
            refreshConsolidatedBalance();
            if (Platform.OS === 'web') {
                window.alert("Pagamento de liquidação registrado com sucesso!");
            } else {
                Alert.alert("Sucesso", "Pagamento de liquidação registrado com sucesso!");
            }
        } catch (err: any) {
            console.error("Erro ao registrar liquidação:", err);
            if (Platform.OS === 'web') {
                window.alert("Não foi possível registrar o pagamento.");
            } else {
                Alert.alert("Erro", "Não foi possível registrar o pagamento.");
            }
        } finally {
            setPaymentSaving(false);
        }
    }

    // History Modal
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

    // Share / Invite Modal
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
        try {
            await Share.share({
                message: `Entre no meu grupo "${group.title}" no FechaConta usando o código de convite abaixo:\n\n${group.id}\n\nAbra o app e insira o código em "Entrar em grupo".`,
            });
        } catch (err) {
            console.error("Erro ao compartilhar convite:", err);
        }
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    if (loading) {
        return <Loading />;
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
            <View style={styles.inner}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ArrowLeft size={24} color="#112332" />
                    </TouchableOpacity>

                    <View style={styles.headerText}>
                        <Text style={styles.sectionTitle}>{group.title}</Text>
                        <Text style={styles.sectionSubtitle}>{numberOfMembers} participantes</Text>
                    </View>
                </View>

                {/* Horizontal Member list with Balances */}
                <FlatList
                    data={calculatedBalances}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.memberList}
                    ListHeaderComponent={
                        <View style={styles.memberItem}>
                            <TouchableOpacity style={styles.addButton} onPress={handleOpenInviteModal}>
                                <UserPlus size={26} color="#111" />
                            </TouchableOpacity>
                            <Text style={styles.memberName}>Convidar</Text>
                            <Text style={styles.memberBalanceLabel}>-</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.memberItem}>
                            <Image
                                source={{ uri: item.avatar }}
                                style={styles.avatar}
                            />
                            <Text style={styles.memberName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
                            <Text style={[
                                styles.memberBalance,
                                item.balance > 0 ? styles.balancePositive : item.balance < 0 ? styles.balanceNegative : styles.balanceZero
                            ]}>
                                {item.balance > 0 ? `+${item.balance.toFixed(0)}` : item.balance < 0 ? `${item.balance.toFixed(0)}` : 'R$0'}
                            </Text>
                        </View>
                    )}
                />

                {/* Dashboard / Balance Card */}
                <View style={[styles.balanceCard, { backgroundColor: group.color }]}>
                    <Text style={styles.label}>Total do Racha</Text>
                    <Text style={styles.value}>R$ {totalExpenses.toFixed(2)}</Text>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Meu Saldo</Text>
                            <Text style={[
                                styles.infoValue,
                                myBalance > 0 ? styles.textPositive : myBalance < 0 ? styles.textNegative : null
                            ]}>
                                {myBalance > 0 ? `A Receber: R$ ${myBalance.toFixed(2)}` : myBalance < 0 ? `A Pagar: R$ ${Math.abs(myBalance).toFixed(2)}` : 'Em dia'}
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Eu paguei</Text>
                            <Text style={styles.infoValue}>R$ {myPaid.toFixed(2)}</Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionItem} onPress={handleAddExpense}>
                            <View style={styles.actionButton}>
                                <Plus size={22} color="#222" />
                            </View>
                            <Text style={styles.actionText}>Despesa</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionItem} 
                            onPress={handleOpenPaymentModal}
                            disabled={myBalance >= 0}
                        >
                            <View style={[styles.actionButton, myBalance >= 0 ? styles.actionButtonDisabled : null]}>
                                <DollarSign size={22} color={myBalance >= 0 ? "#9ca3af" : "#222"} />
                            </View>
                            <Text style={[styles.actionText, myBalance >= 0 ? styles.actionTextDisabled : null]}>Pagar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} onPress={handleOpenHistoryModal}>
                            <View style={styles.actionButton}>
                                <CreditCard size={22} color="#222" />
                            </View>
                            <Text style={styles.actionText}>Histórico</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* History list */}
                <View style={styles.expensesHeader}>
                    <Text style={styles.expensesTitle}>Últimas despesas</Text>
                    <ReceiptText size={22} color="#112332" />
                </View>

                {expenses.length === 0 ? (
                    <View style={styles.emptyExpenses}>
                        <Text style={styles.emptyExpensesText}>Nenhuma despesa registrada ainda.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={expenses.slice(0, 5)}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        contentContainerStyle={styles.expenseList}
                        renderItem={({ item }) => (
                            <ExpenseCard
                                title={item.descricao}
                                author={item.users?.nome || 'Membro'}
                                value={item.valor}
                                date={formatDate(item.created_at)}
                                receiptUrl={item.receipt_url}
                                onPressReceipt={item.receipt_url ? () => {
                                    Alert.alert("Comprovante do Racha", `Link: ${item.receipt_url}`);
                                } : undefined}
                            />
                        )}
                    />
                )}
            </View>

            {/* Modal: Adicionar Despesa */}
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
                            <TouchableOpacity style={styles.closeButton} onPress={handleCloseExpenseModal} disabled={expenseSaving}>
                                <X size={22} color="#112332" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                            <View style={styles.modalForm}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.modalLabel}>Título / Descrição</Text>
                                    <TextInput 
                                        placeholder="Ex: Supermercado, Bebidas, Gasolina..." 
                                        style={styles.modalInput} 
                                        value={expenseTitle}
                                        onChangeText={setExpenseTitle}
                                        editable={!expenseSaving}
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.modalLabel}>Valor (R$)</Text>
                                    <TextInput
                                        placeholder="R$ 0,00"
                                        keyboardType="decimal-pad"
                                        style={styles.modalInput}
                                        value={expenseValue}
                                        onChangeText={setExpenseValue}
                                        editable={!expenseSaving}
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>

                                {/* Select Member Dropdown (Custom Drawer) */}
                                <View style={styles.formGroup}>
                                    <Text style={styles.modalLabel}>Pago por</Text>
                                    <ScrollView 
                                        horizontal 
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.payerList}
                                    >
                                        {members.map((m) => (
                                            <TouchableOpacity
                                                key={m.user_id}
                                                style={[
                                                    styles.payerItem,
                                                    selectedPayerId === m.user_id && styles.payerItemSelected
                                                ]}
                                                onPress={() => setSelectedPayerId(m.user_id)}
                                                disabled={expenseSaving}
                                            >
                                                <Text style={[
                                                    styles.payerText,
                                                    selectedPayerId === m.user_id && styles.payerTextSelected
                                                ]}>
                                                    {m.users?.nome || 'Membro'}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.modalLabel}>Comprovante</Text>
                                    {receiptImage ? (
                                        <View style={styles.receiptPreviewCard}>
                                            <Image source={{ uri: receiptImage.uri }} style={styles.receiptPreview} />
                                            <View style={styles.receiptPreviewInfo}>
                                                <Text style={styles.receiptPreviewTitle}>Recibo anexado</Text>
                                                <Text style={styles.receiptPreviewName} numberOfLines={1}>
                                                    {receiptImage.fileName ?? 'Imagem selecionada'}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.removeReceiptButton}
                                                onPress={() => setReceiptImage(null)}
                                                disabled={expenseSaving}
                                            >
                                                <Trash2 size={18} color="#e5484d" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.receiptPickerButton}
                                            onPress={handleChooseReceiptImage}
                                            disabled={expenseSaving}
                                        >
                                            <View style={styles.receiptPickerIcon}>
                                                <Camera size={22} color="#112332" />
                                            </View>
                                            <View style={styles.receiptPickerText}>
                                                <Text style={styles.receiptPickerTitle}>Adicionar foto do recibo</Text>
                                                <Text style={styles.receiptPickerHint}>Tire uma foto ou escolha da galeria</Text>
                                            </View>
                                            <ImageIcon size={22} color="#65717c" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            <TouchableOpacity 
                                style={styles.saveButton} 
                                onPress={handleExpenseSubmit}
                                disabled={expenseSaving}
                            >
                                {expenseSaving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Salvar despesa</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>

            {/* Modal: Pagar Dívida (Liquidação) */}
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
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>Pagar dívida</Text>
                                <Text style={styles.modalSubtitle}>
                                    Saldo devedor: R$ {Math.abs(myBalance).toFixed(2)}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.closeButton} onPress={handleClosePaymentModal} disabled={paymentSaving}>
                                <X size={22} color="#112332" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalForm}>
                            <View style={styles.formGroup}>
                                <Text style={styles.modalLabel}>Valor pago (R$)</Text>
                                <TextInput
                                    placeholder="R$ 0,00"
                                    keyboardType="decimal-pad"
                                    value={paymentValue}
                                    onChangeText={(value) => {
                                        setPaymentValue(value);
                                        if (paymentError) setPaymentError('');
                                    }}
                                    editable={!paymentSaving}
                                    style={[
                                        styles.modalInput,
                                        paymentError ? styles.modalInputError : null,
                                    ]}
                                    placeholderTextColor="#9ca3af"
                                />
                                {paymentError ? (
                                    <Text style={styles.errorText}>{paymentError}</Text>
                                ) : null}
                            </View>

                            {/* Pago para */}
                            <View style={styles.formGroup}>
                                <Text style={styles.modalLabel}>Pagar para</Text>
                                <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.payerList}
                                >
                                    {members
                                        .filter(m => m.user_id !== currentUser.id)
                                        .map((m) => (
                                            <TouchableOpacity
                                                key={m.user_id}
                                                style={[
                                                    styles.payerItem,
                                                    selectedReceiverId === m.user_id && styles.payerItemSelected
                                                ]}
                                                onPress={() => setSelectedReceiverId(m.user_id)}
                                                disabled={paymentSaving}
                                            >
                                                <Text style={[
                                                    styles.payerText,
                                                    selectedReceiverId === m.user_id && styles.payerTextSelected
                                                ]}>
                                                    {m.users?.nome || 'Membro'}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                </ScrollView>
                            </View>
                        </View>

                        <View style={styles.paymentActions}>
                            <TouchableOpacity 
                                style={styles.cancelButton} 
                                onPress={handleClosePaymentModal}
                                disabled={paymentSaving}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.payButton} 
                                onPress={handlePaymentSubmit}
                                disabled={paymentSaving}
                            >
                                {paymentSaving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.payButtonText}>Registrar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            {/* Modal: Histórico Completo de Despesas */}
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
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>Histórico</Text>
                                <Text style={styles.modalSubtitle}>
                                    Todas as despesas ocorridas no grupo
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.closeButton} onPress={handleCloseHistoryModal}>
                                <X size={22} color="#112332" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={expenses}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.historyList}
                            renderItem={({ item }) => (
                                <ExpenseCard
                                    title={item.descricao}
                                    author={item.users?.nome || 'Membro'}
                                    value={item.valor}
                                    date={formatDate(item.created_at)}
                                    receiptUrl={item.receipt_url}
                                    onPressReceipt={item.receipt_url ? () => {
                                        Alert.alert("Comprovante do Racha", `Link: ${item.receipt_url}`);
                                    } : undefined}
                                />
                            )}
                        />
                    </Animated.View>
                </View>
            </Modal>

            {/* Modal: Convidar Amigos */}
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
                            <View style={{ flex: 1 }}>
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
                            <Text style={styles.inviteCodeLabel}>Código do grupo (UUID)</Text>
                            <Text style={styles.inviteCode} selectable={true}>{group.id}</Text>
                            <Text style={styles.inviteCodeHint}>
                                Qualquer usuário autenticado no FechaConta pode entrar no grupo colando esse código.
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
        paddingBottom: 100,
    },
    inner: {
        paddingHorizontal: 24,
        paddingTop: 54,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 20,
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
        fontSize: 22,
        color: '#112332',
    },
    sectionSubtitle: {
        marginTop: 2,
        fontSize: 13,
        color: '#65717c',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    memberList: {
        paddingVertical: 12,
        gap: 12,
        marginBottom: 16,
    },
    memberItem: {
        width: 72,
        alignItems: 'center',
        gap: 4,
    },
    addButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    memberName: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4c5863',
        textAlign: 'center',
        width: '100%',
    },
    memberBalanceLabel: {
        fontSize: 10,
        color: '#9ca3af',
    },
    memberBalance: {
        fontSize: 10,
        fontWeight: '700',
    },
    balancePositive: {
        color: '#16a34a',
    },
    balanceNegative: {
        color: '#dc2626',
    },
    balanceZero: {
        color: '#6b7280',
    },
    balanceCard: {
        width: '100%',
        borderRadius: 28,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        marginBottom: 28,
    },
    label: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
    },
    value: {
        fontSize: 38,
        fontWeight: 'bold',
        color: '#111',
        marginTop: 6,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 18,
        padding: 14,
    },
    infoBox: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        marginHorizontal: 10,
    },
    infoLabel: {
        fontSize: 12,
        color: '#4b5563',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginTop: 4,
    },
    textPositive: {
        color: '#16a34a',
    },
    textNegative: {
        color: '#dc2626',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 24,
    },
    actionItem: {
        alignItems: 'center',
        gap: 6,
    },
    actionButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    actionButtonDisabled: {
        backgroundColor: '#f3f4f6',
        borderColor: '#e5e7eb',
    },
    actionText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1f2937',
    },
    actionTextDisabled: {
        color: '#9ca3af',
    },
    expensesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    expensesTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 18,
        color: '#112332',
    },
    emptyExpenses: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    emptyExpensesText: {
        color: '#9ca3af',
        fontSize: 14,
    },
    expenseList: {
        paddingBottom: 20,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    expenseModal: {
        width: '100%',
        maxHeight: '90%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    paymentModal: {
        width: '100%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 34,
        backgroundColor: '#fff',
    },
    historyModal: {
        width: '100%',
        height: '80%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 12,
        backgroundColor: '#fff',
    },
    inviteModal: {
        width: '100%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 34,
        backgroundColor: '#fff',
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
        fontSize: 24,
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
        gap: 16,
        marginBottom: 24,
    },
    formGroup: {
        width: '100%',
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
    modalInputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
    payerList: {
        gap: 10,
        paddingVertical: 4,
    },
    payerItem: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    payerItemSelected: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    payerText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#112332',
    },
    payerTextSelected: {
        color: '#fff',
    },
    receiptPickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderStyle: 'dashed',
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        gap: 12,
    },
    receiptPickerIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    receiptPickerText: {
        flex: 1,
    },
    receiptPickerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#112332',
    },
    receiptPickerHint: {
        fontSize: 12,
        color: '#65717c',
        marginTop: 2,
    },
    receiptPreviewCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        gap: 12,
    },
    receiptPreview: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    receiptPreviewInfo: {
        flex: 1,
    },
    receiptPreviewTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#112332',
    },
    receiptPreviewName: {
        fontSize: 12,
        color: '#65717c',
        marginTop: 2,
    },
    removeReceiptButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fde8e8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#112332',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
        marginBottom: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    paymentActions: {
        flexDirection: 'row',
        gap: 12,
    },
    payButton: {
        flex: 1,
        minHeight: 52,
        borderRadius: 26,
        backgroundColor: '#112332',
        alignItems: 'center',
        justifyContent: 'center',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
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
    historyList: {
        paddingBottom: 40,
    },
    inviteCodeCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
    },
    inviteCodeLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    inviteCode: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        width: '100%',
    },
    inviteCodeHint: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 18,
    },
    inviteActions: {
        flexDirection: 'row',
        gap: 12,
    },
    shareButton: {
        flex: 1,
        minHeight: 52,
        borderRadius: 26,
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
    },
});
