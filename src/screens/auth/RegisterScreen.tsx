import { Flame } from 'lucide-react-native';
import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
    Platform
} from 'react-native';

export default function RegisterScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [senhasIguais, setSenhasIguais] = useState(true);

    function handleRegister() {
        if (senha === confirmarSenha) {
            setSenhasIguais(true);
            navigation.navigate('Home');
        } else {
            setSenhasIguais(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>

                    <View style={styles.imageBackground}>
                        <Flame size={80} color="#ff0000" fill="#ff0000" />
                    </View>

                    <Text style={styles.title}>FechaConta</Text>

                    <TextInput
                        placeholder="Email"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        placeholder="Senha"
                        secureTextEntry
                        style={styles.input}
                        value={senha}
                        onChangeText={setSenha}
                    />

                    <TextInput
                        placeholder="Confirme a sua Senha"
                        secureTextEntry
                        style={styles.input}
                        value={confirmarSenha}
                        onChangeText={setConfirmarSenha}
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                    >
                        <Text style={styles.buttonText}>Cadastrar</Text>
                    </TouchableOpacity>

                    {!senhasIguais &&
                        <Text style={{ color: '#ff0000', fontSize: 14 }}>
                            Senhas diferentes, tente novamente!
                        </Text>
                    }

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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