import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { LogOut, UserCircle } from 'lucide-react-native';

export default function ProfileScreen() {
    const { user } = useAuth();

    async function handleLogout() {
        await supabase.auth.signOut();
    }

    return (
        <View style={styles.container}>
            <View style={styles.profileCard}>
                <UserCircle size={80} color="#007AFF" />
                <Text style={styles.name}>{user?.name || 'Utilizador'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut color="#fff" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f5f5f5', alignItems: 'center' },
    profileCard: { width: '100%', backgroundColor: '#fff', padding: 30, borderRadius: 16, alignItems: 'center', marginBottom: 30, elevation: 2 },
    name: { fontSize: 24, fontWeight: 'bold', marginTop: 16, color: '#112332' },
    email: { fontSize: 16, color: '#666', marginTop: 8 },
    logoutButton: { flexDirection: 'row', backgroundColor: '#ff3b30', width: '100%', padding: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});