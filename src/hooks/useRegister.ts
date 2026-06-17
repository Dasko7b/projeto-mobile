import { useState } from 'react';
import { useToast } from '../components/Toast/Toast';
import { register } from '../services/api/auth.api';

export function useRegister() {
    const { showToast } = useToast();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const [nomeError, setNomeError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [senhaError, setSenhaError] = useState('');
    const [confirmarSenhaError, setConfirmarSenhaError] = useState('');
    const [generalError, setGeneralError] = useState('');

    function handleNomeChange(text: string) {
        setNome(text);
        if (nomeError) setNomeError('');
        if (generalError) setGeneralError('');
    }

    function handleEmailChange(text: string) {
        setEmail(text);
        if (emailError) setEmailError('');
        if (generalError) setGeneralError('');
    }

    function handleSenhaChange(text: string) {
        setSenha(text);
        if (senhaError) setSenhaError('');
        if (generalError) setGeneralError('');
    }

    function handleConfirmarSenhaChange(text: string) {
        setConfirmarSenha(text);
        if (confirmarSenhaError) setConfirmarSenhaError('');
        if (generalError) setGeneralError('');
    }

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
            const { error } = await register({
                nome,
                email,
                password: senha,
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

    return {
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
    };
}
