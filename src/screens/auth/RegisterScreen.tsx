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
    Platform,
    Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

export default function RegisterScreen({ navigation }: any) {
    const { setUser } = useAuth();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const [senhasIguais, setSenhasIguais] = useState(true);

    async function handleRegister() {
        if (!email || !senha || !confirmarSenha) {
            Alert.alert("Erro", "Preencha todos os campos");
            return;
        }

        setLoading(true);

        if (senha !== confirmarSenha) {
            setSenhasIguais(false);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: senha,
            options: {
                data: {
                    name: nome,
                    avatarUrl: 'https://i.pravatar.cc/150'
                }
            }
        });

        if (error) {
            Alert.alert("Erro no cadastro:", error.message);
        } else {
            Alert.alert("Sucesso!", "Conta criada com sucesso.");
            navigation.navigate('Login');
        }
        setLoading(false);
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
                        placeholder="Nome Completo"
                        style={styles.input}
                        value={nome}
                        onChangeText={setNome}
                    />

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
