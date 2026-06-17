import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#ffffff',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        paddingTop: 60,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        marginTop: 12,
        fontFamily: 'Inter_700Bold',
        fontSize: 32,
        color: '#112332',
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 8,
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#f9fafb',
    },
    inputError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '600',
        paddingLeft: 4,
    },
    errorBanner: {
        backgroundColor: '#fef2f2',
        borderColor: '#fca5a5',
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
    },
    errorBannerText: {
        color: '#b91c1c',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#112332',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        minHeight: 56,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
