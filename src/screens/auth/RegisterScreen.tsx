import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { Flame, ArrowLeft } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { styles } from '../../styles/auth/RegisterScreen.styles';
import { useToast } from '../../components/Toast/Toast';

export default function RegisterScreen({ navigation }: any) {
    const { showToast } = useToast();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);

    // Estados para erros
    const [nomeError, setNomeError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [senhaError, setSenhaError] = useState('');
    const [confirmarSenhaError, setConfirmarSenhaError] = useState('');
    const [generalError, setGeneralError] = useState('');

    async function handleRegister() {
        
        setNomeError('');
        setEmailError('');
        setSenhaError('');
        setConfirmarSenhaError('');
        setGeneralError('');

        let hasError = false;
        let validationMessage = '';

        if (!nome.trim()) {
            const message = 'Por favor, preencha o seu nome completo.';
            setNomeError(message);
            validationMessage ||= message;
            hasError = true;
        }

        if (!email.trim()) {
            const message = 'Por favor, preencha o seu e-mail.';
            setEmailError(message);
            validationMessage ||= message;
            hasError = true;
        }

        if (!senha) {
            const message = 'Por favor, crie uma senha.';
            setSenhaError(message);
            validationMessage ||= message;
            hasError = true;
        } else if (senha.length < 6) {
            const message = 'A senha deve ter pelo menos 6 caracteres.';
            setSenhaError(message);
            validationMessage ||= message;
            hasError = true;
        }

        if (!confirmarSenha) {
            const message = 'Por favor, confirme a sua senha.';
            setConfirmarSenhaError(message);
            validationMessage ||= message;
            hasError = true;
        } else if (senha !== confirmarSenha) {
            const message = 'As senhas não coincidem.';
            setConfirmarSenhaError(message);
            validationMessage ||= message;
            hasError = true;
        }

        if (hasError) {
            showToast({
                variant: 'warning',
                title: 'Revise os campos',
                message: validationMessage,
            });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
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
                showToast({
                    variant: 'destructive',
                    title: 'Erro ao cadastrar',
                    message: error.message,
                });
                return;
            }

            showToast({
                variant: 'success',
                title: 'Cadastro realizado',
                message: 'Sua conta foi criada com sucesso.',
            });
        } catch (err: any) {
            const message = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
            setGeneralError(message);
            showToast({
                variant: 'destructive',
                title: 'Erro de conexão',
                message,
            });
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
