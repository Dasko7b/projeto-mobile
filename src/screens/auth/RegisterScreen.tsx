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
        if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
            showAlert("Erro de validação", "Por favor, preencha todos os campos.");
            return;
        }

        if (senha !== confirmarSenha) {
            showAlert("Erro de validação", "As senhas não coincidem.");
            return;
        }

        if (senha.length < 6) {
            showAlert("Erro de validação", "A senha deve ter pelo menos 6 caracteres.");
            return;
        }

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
                showAlert("Erro ao cadastrar", error.message);
                return;
            }

            showAlert(
                "Sucesso", 
                "Conta cadastrada com sucesso! Caso não consiga fazer login de imediato, verifique se o e-mail de confirmação é obrigatório na aba Authentication -> Providers do console do seu Supabase.",
                () => navigation.navigate('Login')
            );
        } catch (err: any) {
            showAlert("Erro de conexão", "Não foi possível conectar ao servidor.");
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
                        <TextInput
                            placeholder="Nome Completo"
                            style={styles.input}
                            value={nome}
                            onChangeText={setNome}
                            autoCapitalize="words"
                            placeholderTextColor="#9ca3af"
                        />

                        <TextInput
                            placeholder="E-mail"
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#9ca3af"
                        />

                        <TextInput
                            placeholder="Senha (mínimo 6 caracteres)"
                            secureTextEntry
                            style={styles.input}
                            value={senha}
                            onChangeText={setSenha}
                            placeholderTextColor="#9ca3af"
                        />

                        <TextInput
                            placeholder="Confirme a sua Senha"
                            secureTextEntry
                            style={styles.input}
                            value={confirmarSenha}
                            onChangeText={setConfirmarSenha}
                            placeholderTextColor="#9ca3af"
                        />

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
});
