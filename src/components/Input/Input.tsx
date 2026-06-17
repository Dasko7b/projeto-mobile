import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { styles } from '../../styles/components/Input.styles';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export default function Input({ label, error, style, ...rest }: InputProps) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    style,
                ]}
                placeholderTextColor="#9ca3af"
                {...rest}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}
