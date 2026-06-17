import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ReceiptText } from 'lucide-react-native';
import { styles } from '../../styles/components/ExpenseCard.styles';

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
