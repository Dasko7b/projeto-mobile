import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { styles } from '../../styles/components/Loading.styles';

interface LoadingProps {
    size?: 'small' | 'large';
    color?: string;
}

export default function Loading({ size = 'large', color = '#2563eb' }: LoadingProps) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
}
