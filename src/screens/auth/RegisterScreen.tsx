import React from 'react';
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
import { useRegister } from '../../hooks/useRegister';
import { styles } from '../../styles/auth/RegisterScreen.styles';

export default function RegisterScreen({ navigation }: any) {
    const {
        nome,
        email,
        senha,
        confirmarSenha,
        loading,
        nomeError,
        emailError,
        senhaError,
        confirmarSenhaError,
        generalError,
        handleNomeChange,
        handleEmailChange,
        handleSenhaChange,
        handleConfirmarSenhaChange,
        handleRegister,
    } = useRegister();

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
                                onChangeText={handleNomeChange}
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
                                onChangeText={handleEmailChange}
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
                                onChangeText={handleSenhaChange}
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
                                onChangeText={handleConfirmarSenhaChange}
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
