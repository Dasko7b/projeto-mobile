import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    card: {
        width: '100%',
        minHeight: 200,
        borderRadius: 30,
        padding: 24,
        justifyContent: 'space-between',
        position: 'relative',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    tutor: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
    },
    category: {
        fontSize: 13,
        opacity: 0.6,
        color: '#111',
        marginTop: 2,
    },
    cardTitle: {
        maxWidth: '85%',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginVertical: 12,
    },
    info: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111',
    },
    cardButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrow: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
