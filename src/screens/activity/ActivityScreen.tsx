import { View, Text, StyleSheet } from 'react-native';
import { Receipt } from 'lucide-react-native';

export default function ActivityScreen() {
    return (
        <View style={styles.container}>
            <Receipt size={60} color="#ccc" style={{ marginBottom: 16 }} />
            <Text style={styles.title}>O seu Extrato</Text>
            <Text style={styles.subtitle}>
                Em breve: Aqui aparecerá o balanço total de quem lhe deve dinheiro e a quem você deve, cruzando os dados de todos os seus grupos!
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#112332', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }
});