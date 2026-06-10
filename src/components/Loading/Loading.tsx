import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});
