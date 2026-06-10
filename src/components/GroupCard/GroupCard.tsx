import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface GroupCardProps {
    title: string;
    tutor?: string;
    participantsCount: number;
    color: string;
    onPress: () => void;
}

export default function GroupCard({
    title,
    tutor,
    participantsCount,
    color,
    onPress,
}: GroupCardProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.86}
            onPress={onPress}
            style={[styles.card, { backgroundColor: color || '#f1f5f9' }]}
        >
            <View>
                {tutor && <Text style={styles.tutor}>{tutor}</Text>}
                <Text style={styles.category}>Racha</Text>
            </View>
            
            <Text style={styles.cardTitle} numberOfLines={2}>
                {title}
            </Text>
            
            <Text style={styles.info}>
                {participantsCount} {participantsCount === 1 ? 'participante' : 'participantes'}
            </Text>

            <View style={styles.cardButton}>
                <Text style={styles.arrow}>↗</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        minHeight: 200,
        borderRadius: 30,
        padding: 24,
        justifyContent: 'space-between',
        position: 'relative',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    tutor: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
    },
    category: {
        fontSize: 13,
        opacity: 0.6,
        color: '#111',
        marginTop: 2,
    },
    cardTitle: {
        maxWidth: '85%',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginVertical: 12,
    },
    info: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111',
    },
    cardButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrow: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
