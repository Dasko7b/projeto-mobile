import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    TextInput,
    View,
} from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Trash2, X } from 'lucide-react-native';

type ReceiptImage = {
    uri: string;
    fileName?: string | null;
};

export default function AddExpenseModal({ navigation }: any) {
    const [receiptImage, setReceiptImage] = useState<ReceiptImage | null>(null);

    async function pickReceiptFromCamera() {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            Alert.alert('Permissao necessaria', 'Autorize o acesso a camera para fotografar o recibo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setReceiptImage({
                uri: result.assets[0].uri,
                fileName: result.assets[0].fileName,
            });
        }
    }

    async function pickReceiptFromGallery() {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert('Permissao necessaria', 'Autorize o acesso a galeria para anexar o recibo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setReceiptImage({
                uri: result.assets[0].uri,
                fileName: result.assets[0].fileName,
            });
        }
    }

    function handleChooseReceiptImage() {
        Alert.alert('Adicionar comprovante', 'Escolha como deseja anexar a nota fiscal ou recibo.', [
            {
                text: 'Camera',
                onPress: pickReceiptFromCamera,
            },
            {
                text: 'Galeria',
                onPress: pickReceiptFromGallery,
            },
            {
                text: 'Cancelar',
                style: 'cancel',
            },
        ]);
    }

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

                <View>
                    <Text style={styles.label}>Comprovante</Text>
                    {receiptImage ? (
                        <View style={styles.receiptPreviewCard}>
                            <Image source={{ uri: receiptImage.uri }} style={styles.receiptPreview} />
                            <View style={styles.receiptPreviewInfo}>
                                <Text style={styles.receiptPreviewTitle}>Recibo anexado</Text>
                                <Text style={styles.receiptPreviewName} numberOfLines={1}>
                                    {receiptImage.fileName ?? 'Imagem selecionada'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.removeReceiptButton}
                                onPress={() => setReceiptImage(null)}
                            >
                                <Trash2 size={18} color="#e5484d" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.receiptPickerButton}
                            onPress={handleChooseReceiptImage}
                        >
                            <View style={styles.receiptPickerIcon}>
                                <Camera size={22} color="#112332" />
                            </View>
                            <View style={styles.receiptPickerText}>
                                <Text style={styles.receiptPickerTitle}>Adicionar foto do recibo</Text>
                                <Text style={styles.receiptPickerHint}>Tire uma foto ou escolha da galeria</Text>
                            </View>
                            <ImageIcon size={22} color="#65717c" />
                        </TouchableOpacity>
                    )}
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
    receiptPickerButton: {
        minHeight: 84,
        borderWidth: 1,
        borderColor: '#d8e0e8',
        borderRadius: 16,
        padding: 14,
        backgroundColor: '#f8fafc',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    receiptPickerIcon: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#eef2f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    receiptPickerText: {
        flex: 1,
    },
    receiptPickerTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#112332',
    },
    receiptPickerHint: {
        marginTop: 4,
        fontSize: 13,
        color: '#65717c',
    },
    receiptPreviewCard: {
        minHeight: 86,
        borderWidth: 1,
        borderColor: '#d8e0e8',
        borderRadius: 16,
        padding: 10,
        backgroundColor: '#f8fafc',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    receiptPreview: {
        width: 66,
        height: 66,
        borderRadius: 12,
        backgroundColor: '#eef2f6',
    },
    receiptPreviewInfo: {
        flex: 1,
    },
    receiptPreviewTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#112332',
    },
    receiptPreviewName: {
        marginTop: 4,
        fontSize: 13,
        color: '#65717c',
    },
    removeReceiptButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#fff1f1',
        alignItems: 'center',
        justifyContent: 'center',
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
