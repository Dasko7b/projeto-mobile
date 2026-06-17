import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useLogin } from '../../hooks/useLogin';
import { styles } from '../../styles/auth/LoginScreen.styles';

export default function LoginScreen({ navigation }: any) {
    const {
        email,
        password,
        loading,
        emailError,
        passwordError,
        generalError,
        handleEmailChange,
        handlePasswordChange,
        handleLogin,
    } = useLogin();

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
                        onChangeText={handleEmailChange}
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
                        onChangeText={handlePasswordChange}
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
