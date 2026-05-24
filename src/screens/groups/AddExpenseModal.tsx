import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TextInput,
    View,
} from 'react-native';
import { X } from 'lucide-react-native';

export default function AddExpenseModal({ navigation }: any) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Adicionar despesa</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                    <X size={22} color="#112332" />
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <View>
                    <Text style={styles.label}>Título</Text>
                    <TextInput placeholder="Ex: Mercado" style={styles.input} />
                </View>

                <View>
                    <Text style={styles.label}>Valor</Text>
                    <TextInput placeholder="R$ 0,00" keyboardType="decimal-pad" style={styles.input} />
                </View>

                <View>
                    <Text style={styles.label}>Pago por</Text>
                    <TextInput placeholder="Nome do participante" style={styles.input} />
                </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Salvar despesa</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 24,
        paddingTop: 54,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    title: {
        fontFamily: 'Inter_700Bold',
        fontSize: 30,
        color: '#112332',
    },
    closeButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    form: {
        gap: 18,
        flex: 1,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 10,
        color: '#112332',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d8e0e8',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#f8fafc',
    },
    button: {
        minHeight: 58,
        borderRadius: 29,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
});
