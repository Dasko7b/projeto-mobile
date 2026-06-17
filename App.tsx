import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { useFonts, Inter_700Bold, Inter_400Regular } from '@expo-google-fonts/inter';
import { RootNavigator } from './src/navigations/RootNavigator';
import { isSupabaseConfigured } from './src/services/supabase';
import { ShieldAlert } from 'lucide-react-native';
import Loading from './src/components/Loading/Loading';
import { ToastProvider } from './src/components/Toast/Toast';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function UnconfiguredScreen() {
    return (
        <View style={styles.container}>
            <ShieldAlert size={64} color="#2563eb" />
            <Text style={styles.title}>Configuração do Supabase</Text>
            <Text style={styles.text}>
                O arquivo <Text style={styles.bold}>.env</Text> na raiz do projeto não foi configurado ou contém chaves inválidas.
            </Text>
            <View style={styles.hintContainer}>
                <Text style={styles.hintTitle}>Como configurar:</Text>
                <Text style={styles.hintStep}>1. Abra o arquivo <Text style={styles.bold}>.env</Text> na raiz do projeto.</Text>
                <Text style={styles.hintStep}>2. Defina <Text style={styles.bold}>EXPO_PUBLIC_SUPABASE_URL</Text> com a URL do seu projeto Supabase (deve começar com https://).</Text>
                <Text style={styles.hintStep}>3. Defina <Text style={styles.bold}>EXPO_PUBLIC_SUPABASE_ANON_KEY</Text> com a sua chave anônima (anon key).</Text>
                <Text style={styles.hintStep}>4. Reinicie o Metro Bundler pressionando <Text style={styles.bold}>r</Text> no console ou rodando <Text style={styles.bold}>npx expo start -c</Text>.</Text>
            </View>
        </View>
    );
}

export default function App() {
    const [fontsLoaded] = useFonts({
        Inter_700Bold,
        Inter_400Regular,
    });

    if (!fontsLoaded) {
        return <Loading />;
    }

    if (!isSupabaseConfigured) {
        return <UnconfiguredScreen />;
    }

    return (
        <SafeAreaProvider>
            <AuthProvider>
                <ToastProvider>
                    <RootNavigator />
                </ToastProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    text: {
        fontSize: 15,
        color: '#4b5563',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    hintContainer: {
        backgroundColor: '#f8fafc',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        width: '100%',
        maxWidth: 400,
    },
    hintTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 10,
    },
    hintStep: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 18,
        marginBottom: 8,
    },
    bold: {
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
        color: '#0f172a',
    },
});
