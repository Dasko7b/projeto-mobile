import { Flame } from 'lucide-react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
    const { setUser } = useAuth();

    function handleLogin() {
        setUser({
            name: 'Usuário FechaConta',
            email: 'usuario@fechaconta.app',
            avatarUrl: 'https://i.pravatar.cc/150?img=12',
        });
    }

    function handleregister() {
        navigation.navigate('Register');
    }

    return (
        <View style={styles.container}>

            <View style={styles.imageBackground}>
                <Flame size={80} color="#ff0000" fill="#ff0000" />
            </View>

            <Text style={styles.title}>FechaConta</Text>

            <TextInput
                placeholder="Email"
                style={styles.input}
            />

            <TextInput
                placeholder="Senha"
                secureTextEntry
                style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={() => handleLogin()}>
                <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={{ marginTop: 20, padding: 10, alignItems: 'center' }}
                onPress={() => handleregister()}
            >
                <Text style={{ color: '#666', fontSize: 14 }}>
                    Não tem uma conta? <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Cadastre-se</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#ffffff',
    },

    title: {
        marginBottom: 32,
        textAlign: 'center',
        fontFamily: 'Inter_700Bold',
        fontSize: 38,
        color: '#112332'
    },

    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
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

    imageBackground: {
        margin: 'auto',
        marginVertical: 0,
    },
});
