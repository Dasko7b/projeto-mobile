import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Flame, ArrowLeft } from 'lucide-react-native';
import { supabase } from '../../services/supabase';

export default function RegisterScreen({ navigation }: any) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);

    // Inline Error States
    const [nomeError, setNomeError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [senhaError, setSenhaError] = useState('');
    const [confirmarSenhaError, setConfirmarSenhaError] = useState('');
    const [generalError, setGeneralError] = useState('');

    function showAlert(title: string, message: string, onPress?: () => void) {
        if (Platform.OS === 'web') {
            window.alert(`${title}: ${message}`);
            if (onPress) onPress();
        } else {
            Alert.alert(
                title, 
                message, 
                onPress ? [{ text: "OK", onPress }] : undefined
            );
        }
    }

    async function handleRegister() {
        // Reset Error States
        setNomeError('');
        setEmailError('');
        setSenhaError('');
        setConfirmarSenhaError('');
        setGeneralError('');

        let hasError = false;

        if (!nome.trim()) {
            setNomeError('Por favor, preencha o seu nome completo.');
            hasError = true;
        }

        if (!email.trim()) {
            setEmailError('Por favor, preencha o seu e-mail.');
            hasError = true;
        }

        if (!senha) {
            setSenhaError('Por favor, crie uma senha.');
            hasError = true;
        } else if (senha.length < 6) {
            setSenhaError('A senha deve ter pelo menos 6 caracteres.');
            hasError = true;
        }

        if (!confirmarSenha) {
            setConfirmarSenhaError('Por favor, confirme a sua senha.');
            hasError = true;
        } else if (senha !== confirmarSenha) {
            setConfirmarSenhaError('As senhas não coincidem.');
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: senha,
                options: {
                    data: {
                        nome: nome.trim(),
                    }
                }
            });

            if (error) {
                setGeneralError(error.message);
                return;
            }

            showAlert(
                "Sucesso", 
                "Conta cadastrada com sucesso! Caso não consiga fazer login de imediato, verifique se o e-mail de confirmação é obrigatório na aba Authentication -> Providers do console do seu Supabase.",
                () => navigation.navigate('Login')
            );
        } catch (err: any) {
            setGeneralError('Não foi possível conectar ao servidor. Verifique sua conexão.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                style={styles.scrollView}
            >
                <View style={styles.container}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <ArrowLeft size={24} color="#112332" />
                    </TouchableOpacity>

                    <View style={styles.logoContainer}>
                        <Flame size={64} color="#2563eb" fill="#2563eb" />
                        <Text style={styles.title}>Criar Conta</Text>
                        <Text style={styles.subtitle}>Cadastre-se para começar a rachar suas despesas.</Text>
                    </View>

                    <View style={styles.form}>
                        {generalError ? (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorBannerText}>{generalError}</Text>
                            </View>
                        ) : null}

                        <View style={styles.inputGroup}>
                            <TextInput
                                placeholder="Nome Completo"
                                style={[
                                    styles.input,
                                    nomeError ? styles.inputError : null
                                ]}
                                value={nome}
                                onChangeText={(text) => {
                                    setNome(text);
                                    if (nomeError) setNomeError('');
                                }}
                                autoCapitalize="words"
                                placeholderTextColor="#9ca3af"
                                editable={!loading}
                            />
                            {nomeError ? <Text style={styles.errorText}>{nomeError}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <TextInput
                                placeholder="E-mail"
                                style={[
                                    styles.input,
                                    emailError ? styles.inputError : null
                                ]}
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (emailError) setEmailError('');
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#9ca3af"
                                editable={!loading}
                            />
                            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <TextInput
                                placeholder="Senha (mínimo 6 caracteres)"
                                secureTextEntry
                                style={[
                                    styles.input,
                                    senhaError ? styles.inputError : null
                                ]}
                                value={senha}
                                onChangeText={(text) => {
                                    setSenha(text);
                                    if (senhaError) setSenhaError('');
                                }}
                                placeholderTextColor="#9ca3af"
                                editable={!loading}
                            />
                            {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <TextInput
                                placeholder="Confirme a sua Senha"
                                secureTextEntry
                                style={[
                                    styles.input,
                                    confirmarSenhaError ? styles.inputError : null
                                ]}
                                value={confirmarSenha}
                                onChangeText={(text) => {
                                    setConfirmarSenha(text);
                                    if (confirmarSenhaError) setConfirmarSenhaError('');
                                }}
                                placeholderTextColor="#9ca3af"
                                editable={!loading}
                            />
                            {confirmarSenhaError ? <Text style={styles.errorText}>{confirmarSenhaError}</Text> : null}
                        </View>

                        <TouchableOpacity 
                            style={styles.button} 
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Cadastrar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#ffffff',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        paddingTop: 60,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        marginTop: 12,
        fontFamily: 'Inter_700Bold',
        fontSize: 32,
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
});
