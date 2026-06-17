import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Flame } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { styles } from '../../styles/auth/LoginScreen.styles';
import { useToast } from '../../components/Toast/Toast';

export default function LoginScreen({ navigation }: any) {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Estados para erros
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');

    async function handleLogin() {

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
                let message = error.message;

                if (errMsg.includes('invalid login credentials') || errMsg.includes('invalid credentials')) {
                    message = 'E-mail ou senha incorretos.';
                } else if (errMsg.includes('email not confirmed')) {
                    message = 'O e-mail ainda não foi confirmado no Supabase. Verifique sua caixa de entrada.';
                }

                setGeneralError(message);
                showToast({
                    variant: 'destructive',
                    title: 'Erro ao entrar',
                    message,
                });
                return;
            }

            showToast({
                variant: 'success',
                title: 'Login realizado',
                message: 'Bem-vindo de volta ao FechaConta.',
            });
            
        } catch (err: any) {
            console.error(err);
            const message = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
            setGeneralError(message);
            showToast({
                variant: 'destructive',
                title: 'Erro de conexão',
                message,
            });
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
