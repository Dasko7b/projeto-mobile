import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { Flame } from 'lucide-react-native';
import { supabase } from '../../services/supabase';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Error States for Inline Feedback
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');

    function showAlert(title: string, message: string) {
        if (Platform.OS === 'web') {
            window.alert(`${title}: ${message}`);
        } else {
            Alert.alert(title, message);
        }
    }

    async function handleLogin() {
        // Reset Errors
        setEmailError('');
        setPasswordError('');
        setGeneralError('');

        let hasError = false;

        if (!email.trim()) {
            setEmailError('Por favor, insira o seu e-mail.');
            hasError = true;
        }

        if (!password) {
            setPasswordError('Por favor, insira a sua senha.');
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (error) {
                const errMsg = error.message.toLowerCase();
                if (errMsg.includes('invalid login credentials') || errMsg.includes('invalid credentials')) {
                    setGeneralError('E-mail ou senha incorretos.');
                } else if (errMsg.includes('email not confirmed')) {
                    setGeneralError('O e-mail ainda não foi confirmado no Supabase. Verifique sua caixa de entrada.');
                } else {
                    setGeneralError(error.message);
                }
            }
        } catch (err: any) {
            console.error(err);
            setGeneralError('Não foi possível conectar ao servidor. Verifique sua conexão.');
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
                {generalError ? (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorBannerText}>{generalError}</Text>
                    </View>
                ) : null}

                <View style={styles.inputGroup}>
                    <TextInput
                        placeholder="E-mail"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (emailError) setEmailError('');
                            if (generalError) setGeneralError('');
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={[
                            styles.input,
                            emailError ? styles.inputError : null
                        ]}
                        placeholderTextColor="#9ca3af"
                        editable={!loading}
                    />
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                    <TextInput
                        placeholder="Senha"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (passwordError) setPasswordError('');
                            if (generalError) setGeneralError('');
                        }}
                        secureTextEntry
                        style={[
                            styles.input,
                            passwordError ? styles.inputError : null
                        ]}
                        placeholderTextColor="#9ca3af"
                        editable={!loading}
                    />
                    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

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
    inputGroup: {
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#f9fafb',
    },
    inputError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '600',
        paddingLeft: 4,
    },
    errorBanner: {
        backgroundColor: '#fef2f2',
        borderColor: '#fca5a5',
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
    },
    errorBannerText: {
        color: '#b91c1c',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
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
