import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

export default function CreateGroupScreen({ navigation }: any) {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleCreateGroup() {
        if (!name.trim()) return Alert.alert("Erro", "O nome do grupo é obrigatório.");
        setLoading(true);

        try {
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .insert([{ name }])
                .select()
                .single();

            if (groupError) throw groupError;

        
            const { error: memberError } = await supabase
                .from('group_members')
                .insert([{ group_id: groupData.id, user_id: (await supabase.auth.getUser()).data.user?.id }]);

            if (memberError) throw memberError;

            Alert.alert("Sucesso", "Grupo criado com sucesso!");
            navigation.goBack(); 
        } catch (error: any) {
            Alert.alert("Erro ao criar grupo", error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Novo Grupo</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: Viagem, República, Churrasco..."
                value={name}
                onChangeText={setName}
            />
            <TouchableOpacity style={styles.button} onPress={handleCreateGroup} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? "Criando..." : "Criar Grupo"}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 16, borderRadius: 8, marginBottom: 20 },
    button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});