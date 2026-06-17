import { useState } from 'react';
import { useToast } from '../components/Toast/Toast';
import { login } from '../services/api/auth.api';

export function useLogin() {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');

    function handleEmailChange(text: string) {
        setEmail(text);
        if (emailError) setEmailError('');
        if (generalError) setGeneralError('');
    }

    function handlePasswordChange(text: string) {
        setPassword(text);
        if (passwordError) setPasswordError('');
        if (generalError) setGeneralError('');
    }

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
            const { error } = await login({ email, password });

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

    return {
        email,
        password,
        loading,
        emailError,
        passwordError,
        generalError,
        handleEmailChange,
        handlePasswordChange,
        handleLogin,
    };
}
