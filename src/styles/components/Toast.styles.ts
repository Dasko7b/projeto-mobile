import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    portal: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
        elevation: 999,
    },
    position: {
        position: 'absolute',
        top: 12,
        left: 16,
        right: 16,
    },
    toast: {
        minHeight: 64,
        borderRadius: 16,
        borderWidth: 1,
        paddingVertical: 12,
        paddingLeft: 12,
        paddingRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#0f172a',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.16,
        shadowRadius: 18,
        elevation: 8,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    message: {
        marginTop: 2,
        fontSize: 13,
        lineHeight: 18,
        color: '#4b5563',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
});

export const toastVariants = {
    success: {
        container: {
            backgroundColor: '#ecfdf5',
            borderColor: '#a7f3d0',
        },
        iconContainer: {
            backgroundColor: '#d1fae5',
        },
        icon: {
            color: '#047857',
        },
        title: {
            color: '#064e3b',
        },
        message: {
            color: '#065f46',
        },
        close: {
            color: '#047857',
        },
    },
    warning: {
        container: {
            backgroundColor: '#fffbeb',
            borderColor: '#fde68a',
        },
        iconContainer: {
            backgroundColor: '#fef3c7',
        },
        icon: {
            color: '#b45309',
        },
        title: {
            color: '#78350f',
        },
        message: {
            color: '#92400e',
        },
        close: {
            color: '#b45309',
        },
    },
    destructive: {
        container: {
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca',
        },
        iconContainer: {
            backgroundColor: '#fee2e2',
        },
        icon: {
            color: '#dc2626',
        },
        title: {
            color: '#7f1d1d',
        },
        message: {
            color: '#991b1b',
        },
        close: {
            color: '#dc2626',
        },
    },
} as const;
