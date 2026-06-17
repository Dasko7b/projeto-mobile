import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingHorizontal: 24,
        backgroundColor: '#fff',
        paddingTop: 34,
        paddingBottom: 16,
    },

    logo: {
        fontSize: 28,
        fontFamily: 'Inter_700Bold',
        color: '#112332',

        letterSpacing: -1,
    },

    profileButton: {
        position: 'relative',

        width: 52,
        height: 52,

        borderRadius: 999,

        justifyContent: 'center',
        alignItems: 'center',

        backgroundColor: '#f1f5f9',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 999,
    },

    onlineIndicator: {
        position: 'absolute',

        right: 2,
        bottom: 2,

        width: 14,
        height: 14,

        borderRadius: 999,

        backgroundColor: '#8b5cf6',

        borderWidth: 2,
        borderColor: '#fff',
    },
});
