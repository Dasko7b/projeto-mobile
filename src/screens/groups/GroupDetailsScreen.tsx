import React from 'react';
import {
    Animated,
    Alert,
    Image,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    Modal,
    ScrollView,
    TextInput,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { ArrowLeft, Camera, CreditCard, DollarSign, Image as ImageIcon, Plus, ReceiptText, Share2, Trash2, UserPlus, X } from 'lucide-react-native';
import Loading from '../../components/Loading/Loading';
import ExpenseCard from '../../components/ExpenseCard/ExpenseCard';
import { styles } from '../../styles/groups/GroupDetailsScreen.styles';
import { GroupData } from '../../services/api/groups.api';
import { useGroupDetails } from '../../hooks/useGroupDetails';

export default function GroupDetailsScreen({ route, navigation }: any) {
    const group = route.params?.group as GroupData;
    const {
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
    } = useGroupDetails(group);

    if (!group || !currentUser || loading) {
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
