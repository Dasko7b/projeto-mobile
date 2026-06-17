import React from 'react';
import {
    ArrowLeft } from 'lucide-react-native';
import { View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useCreateGroup } from '../../hooks/useCreateGroup';
import { styles } from '../../styles/groups/createGroupForm.styles';

export default function CreateGroupScreen({ navigation }: any) {
    const {
        categories,
        nome,
        selectedCategory,
        loading,
        setNome,
        setSelectedCategory,
        handleCreateGroup,
        handleGoBack,
    } = useCreateGroup(navigation);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={handleGoBack}
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
