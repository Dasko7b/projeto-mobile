import { useState } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function CreateGroupScreen({ navigation }: any) {

    function handleNavigate() {
        navigation.navigate('GroupsScreen');
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
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={22} color="#112332" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Novo grupo</Text>
            </View>

            <Text style={styles.title}>Criar Racha</Text>
            <Text style={styles.description}>
                Organize um grupo para dividir contas, acompanhar pagamentos e manter tudo no lugar.
            </Text>

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
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
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
