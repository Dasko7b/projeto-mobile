import React, { useState } from 'react';
import {
    ArrowLeft } from 'lucide-react-native';
import { View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../styles/groups/createGroupForm.styles';

export default function CreateGroupScreen({ navigation }: any) {
    const { user, refreshConsolidatedBalance } = useAuth();
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
            Alert.alert("Erro", "Por favor, digite o nome do Racha.");
            return;
        }

        if (!user) {
            Alert.alert("Erro", "Usuário não autenticado.");
            return;
        }

        setLoading(true);
        try {
            // Call the database function to create the group and add the user as a member atomically
            const { data: groupData, error: groupError } = await supabase
                .rpc('create_group_with_member', {
                    group_name: nome.trim(),
                    user_id: user.id
                });

            if (groupError) throw groupError;

            if (groupData) {
                // Refresh consolidated balance and go back
                await refreshConsolidatedBalance();
                if (Platform.OS === 'web') {
                    window.alert("Racha criado com sucesso!");
                    navigation.goBack();
                } else {
                    Alert.alert("Sucesso", "Racha criado com sucesso!", [
                        { text: "OK", onPress: () => navigation.goBack() }
                    ]);
                }
            }
        } catch (error: any) {
            console.error("Erro ao criar grupo:", error);
            Alert.alert("Erro ao criar grupo", error.message || "Erro desconhecido.");
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
