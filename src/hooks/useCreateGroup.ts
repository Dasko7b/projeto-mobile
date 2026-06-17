import { useState } from 'react';
import { useToast } from '../components/Toast/Toast';
import { useAuth } from '../context/AuthContext';
import { createGroupWithMember } from '../services/api/groups.api';

const categories = [
    'Casa',
    'Viagem',
    'Festa',
    'Faculdade',
    'Mercado',
];

export function useCreateGroup(navigation: any) {
    const { user, refreshConsolidatedBalance } = useAuth();
    const { showToast } = useToast();
    const [nome, setNome] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Casa');
    const [loading, setLoading] = useState(false);

    async function handleCreateGroup() {
        if (!nome.trim()) {
            showToast({
                variant: 'warning',
                title: 'Nome obrigatório',
                message: 'Por favor, digite o nome do Racha.',
            });
            return;
        }

        if (!user) {
            showToast({
                variant: 'destructive',
                title: 'Sessão inválida',
                message: 'Usuário não autenticado.',
            });
            return;
        }

        setLoading(true);
        try {
            const groupData = await createGroupWithMember(nome, user.id);

            if (groupData) {
                await refreshConsolidatedBalance();
                showToast({
                    variant: 'success',
                    title: 'Racha criado',
                    message: 'Seu grupo foi criado com sucesso.',
                });
                setTimeout(() => {
                    navigation.goBack();
                }, 700);
            }
        } catch (error: any) {
            console.error('Erro ao criar grupo:', error);
            showToast({
                variant: 'destructive',
                title: 'Erro ao criar grupo',
                message: error.message || 'Erro desconhecido.',
            });
        } finally {
            setLoading(false);
        }
    }

    function handleGoBack() {
        navigation.goBack();
    }

    return {
        categories,
        nome,
        selectedCategory,
        loading,
        setNome,
        setSelectedCategory,
        handleCreateGroup,
        handleGoBack,
    };
}
