import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Animated,
    Easing,
    Platform,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CircleCheck, CircleX, TriangleAlert, X } from 'lucide-react-native';
import { styles, toastVariants } from '../../styles/components/Toast.styles';

export type ToastVariant = 'success' | 'warning' | 'destructive';

type ToastOptions = {
    title: string;
    message?: string;
    variant?: ToastVariant;
    duration?: number;
};

type ToastState = Required<Pick<ToastOptions, 'title' | 'variant' | 'duration'>> & {
    message?: string;
};

type ToastContextType = {
    showToast: (options: ToastOptions) => void;
    hideToast: () => void;
};

const DEFAULT_DURATION = 3200;
const ToastContext = createContext<ToastContextType | null>(null);

const variantIcons = {
    success: CircleCheck,
    warning: TriangleAlert,
    destructive: CircleX,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<ToastState | null>(null);
    const translateY = useRef(new Animated.Value(-24)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const hideToast = useCallback(() => {
        clearTimer();

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 180,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -24,
                duration: 180,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => setToast(null));
    }, [clearTimer, opacity, translateY]);

    const showToast = useCallback(
        ({ title, message, variant = 'success', duration = DEFAULT_DURATION }: ToastOptions) => {
            clearTimer();
            setToast({ title, message, variant, duration });

            translateY.setValue(-24);
            opacity.setValue(0);

            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 220,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 220,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();

            timerRef.current = setTimeout(hideToast, duration);
        },
        [clearTimer, hideToast, opacity, translateY]
    );

    useEffect(() => clearTimer, [clearTimer]);

    const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);
    const Icon = toast ? variantIcons[toast.variant] : CircleCheck;
    const variantStyle = toast ? toastVariants[toast.variant] : toastVariants.success;

    return (
        <ToastContext.Provider value={value}>
            {children}
            <View pointerEvents="box-none" style={styles.portal}>
                {toast && (
                    <Animated.View
                        pointerEvents="box-none"
                        style={[
                            styles.position,
                            {
                                paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
                                opacity,
                                transform: [{ translateY }],
                            },
                        ]}
                    >
                        <View style={[styles.toast, variantStyle.container]}>
                            <View style={[styles.iconContainer, variantStyle.iconContainer]}>
                                <Icon size={20} color={variantStyle.icon.color} />
                            </View>

                            <View style={styles.content}>
                                <Text style={[styles.title, variantStyle.title]}>{toast.title}</Text>
                                {toast.message ? (
                                    <Text style={[styles.message, variantStyle.message]}>
                                        {toast.message}
                                    </Text>
                                ) : null}
                            </View>

                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Fechar aviso"
                                hitSlop={8}
                                onPress={hideToast}
                                style={styles.closeButton}
                            >
                                <X size={18} color={variantStyle.close.color} />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}
            </View>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used inside ToastProvider.');
    }

    return context;
}
