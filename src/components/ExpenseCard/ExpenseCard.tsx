import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ReceiptText } from 'lucide-react-native';

interface ExpenseCardProps {
    title: string;
    author: string;
    value: number;
    date?: string;
    receiptUrl?: string | null;
    onPressReceipt?: () => void;
}

export default function ExpenseCard({
    title,
    author,
    value,
    date,
    receiptUrl,
    onPressReceipt,
}: ExpenseCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.left}>
                <View style={styles.iconContainer}>
                    <ReceiptText size={20} color="#112332" />
                </View>
                <View style={styles.info}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.author}>Pago por {author}</Text>
                    {date && <Text style={styles.date}>{date}</Text>}
                </View>
            </View>
            
            <View style={styles.right}>
                <Text style={styles.value}>R$ {value.toFixed(2)}</Text>
                {receiptUrl && onPressReceipt && (
                    <TouchableOpacity style={styles.receiptButton} onPress={onPressReceipt}>
                        <Text style={styles.receiptButtonText}>Ver Recibo</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 12,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    author: {
        fontSize: 13,
        color: '#4b5563',
        marginTop: 2,
    },
    date: {
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 2,
    },
    right: {
        alignItems: 'flex-end',
    },
    value: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
    },
    receiptButton: {
        marginTop: 6,
        backgroundColor: '#e0f2fe',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    receiptButtonText: {
        fontSize: 11,
        color: '#0369a1',
        fontWeight: '600',
    },
});
