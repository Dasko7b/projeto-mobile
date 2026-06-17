import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/components/GroupCard.styles';

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
