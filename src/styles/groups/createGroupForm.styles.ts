import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
        gap: 18,
        paddingTop: 54,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 8,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#112332',
    },
    title: {
        fontFamily: 'Inter_700Bold',
        fontSize: 42,
        color: '#112332',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#5f6b76',
        marginBottom: 10,
    },
    formGroup: {
        width: '100%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#f9fafb',
    },
    button: {
        backgroundColor: '#112332',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
        marginTop: 12,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#112332',
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    badge: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 999,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#dbe4ee',
    },
    badgeSelected: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    badgeText: {
        color: '#112332',
        fontWeight: '600',
    },
    badgeTextSelected: {
        color: '#fff',
    },
});
