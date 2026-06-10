import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Flame } from 'lucide-react-native';
import { supabase } from '../../services/supabase';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (!email || !password) {
            Alert.alert("Campos obrigatórios", "Por favor, preencha o email e a senha.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (error) {
                Alert.alert("Erro ao entrar", error.message);
            }
        } catch (err: any) {
            Alert.alert("Erro de conexão", "Não foi possível conectar ao servidor.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function handleRegister() {
        navigation.navigate('Register');
    }

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Flame size={72} color="#2563eb" fill="#2563eb" />
                <Text style={styles.title}>FechaConta</Text>
                <Text style={styles.subtitle}>Rache, controle e pague contas de forma simples.</Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    placeholder="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                />

                <TextInput
                    placeholder="Senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                />

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Entrar</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.registerLink}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.registerLinkText}>
                        Não tem uma conta? <Text style={styles.registerHighlight}>Cadastre-se</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#ffffff',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        marginTop: 12,
        fontFamily: 'Inter_700Bold',
        fontSize: 36,
        color: '#112332',
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 8,
    },
    form: {
        width: '100%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#f9fafb',
    },
    button: {
        backgroundColor: '#112332',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        minHeight: 56,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    registerLink: {
        marginTop: 24,
        padding: 10,
        alignItems: 'center',
    },
    registerLinkText: {
        color: '#4b5563',
        fontSize: 14,
    },
    registerHighlight: {
        color: '#2563eb',
        fontWeight: 'bold',
    },
});
