import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function CreateGroupScreen({ navigation }: any) {

    function handleNavigate() {
        navigation.navigate('Home');
    }

    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = [
        'Casa',
        'Viagem',
        'Festa',
        'Faculdade',
        'Mercado',
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Criar Racha</Text>
            <View>
                <Text style={styles.label}>Nome do Racha</Text>
                <TextInput placeholder="Nome do Racha" style={styles.input} />
            </View>
            <View style={{ gap: 12 }}>
                <Text style={styles.label}>Categoria</Text>

                <View style={styles.badgeContainer}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.badge,
                                selectedCategory === category &&
                                styles.badgeSelected,
                            ]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text
                                style={[
                                    styles.badgeText,
                                    selectedCategory === category &&
                                    styles.badgeTextSelected,
                                ]}
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => handleNavigate()}>
                <Text style={styles.buttonText}>Criar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#fff',
        gap: 12,
    },
    title: {
        fontFamily: 'Inter_700Bold',
        fontSize: 48,
        color: '#112332',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 14,
    },
    button: {
        backgroundColor: '#000',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    label: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
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
        backgroundColor: '#112332',
        borderColor: '#112332',
    },

    badgeText: {
        color: '#112332',
        fontFamily: 'Inter_600SemiBold',
    },

    badgeTextSelected: {
        color: '#fff',
    },
});