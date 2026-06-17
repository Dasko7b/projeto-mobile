import React, { useState } from 'react';
import {
    ArrowLeft } from 'lucide-react-native';
import { View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../styles/groups/createGroupForm.styles';
import { useToast } from '../../components/Toast/Toast';

export default function CreateGroupScreen({ navigation }: any) {
    const { user, refreshConsolidatedBalance } = useAuth();
    const { showToast } = useToast();
    const [nome, setNome] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Casa');
    const [loading, setLoading] = useState(false);

    const categories = [
        'Casa',
        'Viagem',
        'Festa',
        'Faculdade',
        'Mercado',
    ];

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
            
            const { data: groupData, error: groupError } = await supabase
                .rpc('create_group_with_member', {
                    group_name: nome.trim(),
                    user_id: user.id
                });

            if (groupError) throw groupError;

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
            console.error("Erro ao criar grupo:", error);
            showToast({
                variant: 'destructive',
                title: 'Erro ao criar grupo',
                message: error.message || 'Erro desconhecido.',
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <ArrowLeft size={22} color="#112332" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Novo grupo</Text>
            </View>

            <Text style={styles.title}>Criar Racha</Text>
            <Text style={styles.description}>
                Organize um grupo para dividir contas, acompanhar pagamentos e manter tudo no lugar.
            </Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Nome do Racha</Text>
                <TextInput 
                    placeholder="Ex: Viagem de Férias, República..." 
                    style={styles.input} 
                    value={nome}
                    onChangeText={setNome}
                    editable={!loading}
                    placeholderTextColor="#9ca3af"
                />
            </View>

            <View style={{ gap: 12 }}>
                <Text style={styles.label}>Categoria</Text>
                <View style={styles.badgeContainer}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.badge,
                                selectedCategory === category && styles.badgeSelected,
                            ]}
                            onPress={() => setSelectedCategory(category)}
                            disabled={loading}
                        >
                            <Text
                                style={[
                                    styles.badgeText,
                                    selectedCategory === category && styles.badgeTextSelected,
                                ]}
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity 
                style={styles.button} 
                onPress={handleCreateGroup}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Criar</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}
