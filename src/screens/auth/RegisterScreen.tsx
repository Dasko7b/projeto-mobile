import { Flame, LayersPlus } from 'lucide-react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

export default function RegisterScreen({ navigation }: any) {

    function handleRegister() {
        navigation.navigate('Home');
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

            <TouchableOpacity style={styles.button} onPress={() => handleRegister()}>
                <Text style={styles.buttonText}>Cadastrar</Text>
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