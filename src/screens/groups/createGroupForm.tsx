import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
        gap: 18,
        paddingTop: 54,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 8,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#112332',
    },
    title: {
        fontFamily: 'Inter_700Bold',
        fontSize: 42,
        color: '#112332',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#5f6b76',
        marginBottom: 10,
    },
    formGroup: {
        width: '100%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#f9fafb',
    },
    button: {
        backgroundColor: '#112332',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
        marginTop: 12,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#112332',
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    badge: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 999,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#dbe4ee',
    },
    badgeSelected: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    badgeText: {
        color: '#112332',
        fontWeight: '600',
    },
    badgeTextSelected: {
        color: '#fff',
    },
});
