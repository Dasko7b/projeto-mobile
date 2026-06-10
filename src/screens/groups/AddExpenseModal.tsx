import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { supabase } from '../../services/supabase';

export default function AddExpenseModal({ route, navigation }: any) {
    const { groupId } = route.params;
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!description || !amount) return Alert.alert("Erro", "Preencha valor e descrição");
        setLoading(true);

        try {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            
            const { error } = await supabase.from('expenses').insert([{
                group_id: groupId,
                user_id: userId,
                description,
                amount: parseFloat(amount),
                receipt_url: imageUri 
            }]);

            if (error) throw error;
            navigation.goBack(); 
        } catch (error: any) {
            Alert.alert("Erro", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Nova Despesa</Text>
            
            <TextInput style={styles.input} placeholder="Descrição (ex: Mercado)" value={description} onChangeText={setDescription} />
            <TextInput style={styles.input} placeholder="Valor (ex: 50.00)" keyboardType="numeric" value={amount} onChangeText={setAmount} />

            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Camera color="#666" size={24} style={{ marginRight: 8 }} />
                <Text style={{ color: '#666' }}>{imageUri ? 'Foto anexada!' : 'Anexar Recibo (Opcional)'}</Text>
            </TouchableOpacity>

            {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                <Text style={styles.saveButtonText}>{loading ? 'Salvando...' : 'Salvar Despesa'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 16, borderRadius: 8, marginBottom: 16 },
    imageButton: { flexDirection: 'row', backgroundColor: '#f0f0f0', padding: 16, borderRadius: 8, marginBottom: 16, alignItems: 'center', justifyContent: 'center' },
    previewImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
    saveButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});