import {
    Bell,
    ChevronRight,
    CreditCard,
    LogOut,
    Mail,
    ShieldCheck,
    UserRound,
    WalletCards,
} from 'lucide-react-native';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
    const { user, setUser } = useAuth();

    const profile = {
        name: user?.name ?? 'Usuario FechaConta',
        email: user?.email ?? 'usuario@fechaconta.app',
        avatarUrl: user?.avatarUrl ?? 'https://i.pravatar.cc/150?img=12',
    };

    function handleLogout() {
        setUser(null);
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <View style={styles.avatarWrapper}>
                    <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                </View>

                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.email}>{profile.email}</Text>

                <TouchableOpacity style={styles.editButton}>
                    <UserRound size={18} color="#112332" />
                    <Text style={styles.editButtonText}>Editar perfil</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>3</Text>
                    <Text style={styles.statLabel}>Grupos</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statValue}>R$ 650</Text>
                    <Text style={styles.statLabel}>Pago</Text>
                </View>
            </View>

            <View style={styles.balanceCard}>
                <View style={styles.balanceIcon}>
                    <WalletCards size={28} color="#112332" />
                </View>

                <View style={styles.balanceText}>
                    <Text style={styles.balanceLabel}>Saldo geral</Text>
                    <Text style={styles.balanceValue}>R$ 350,00</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Conta</Text>

                <ProfileOption
                    icon={<Mail size={22} color="#112332" />}
                    title="Dados pessoais"
                    subtitle="Nome, email e informacoes da conta"
                />

                <ProfileOption
                    icon={<CreditCard size={22} color="#112332" />}
                    title="Pagamentos"
                    subtitle="Metodos e preferencias de pagamento"
                />

                <ProfileOption
                    icon={<Bell size={22} color="#112332" />}
                    title="Notificacoes"
                    subtitle="Alertas de grupos, dividas e pagamentos"
                />

                <ProfileOption
                    icon={<ShieldCheck size={22} color="#112332" />}
                    title="Seguranca"
                    subtitle="Senha e acesso ao aplicativo"
                />
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut size={22} color="#fff" />
                <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

function ProfileOption({
    icon,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <TouchableOpacity style={styles.optionCard}>
            <View style={styles.optionIcon}>
                {icon}
            </View>

            <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{title}</Text>
                <Text style={styles.optionSubtitle}>{subtitle}</Text>
            </View>

            <ChevronRight size={22} color="#9aa5b1" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 54,
        paddingBottom: 120,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarWrapper: {
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 5,
    },
    avatar: {
        width: 104,
        height: 104,
        borderRadius: 52,
    },
    name: {
        marginTop: 18,
        fontFamily: 'Inter_700Bold',
        fontSize: 30,
        color: '#112332',
        textAlign: 'center',
    },
    email: {
        marginTop: 6,
        fontSize: 15,
        color: '#65717c',
        textAlign: 'center',
    },
    editButton: {
        marginTop: 18,
        minHeight: 46,
        borderRadius: 23,
        paddingHorizontal: 18,
        backgroundColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    editButtonText: {
        color: '#112332',
        fontSize: 15,
        fontWeight: '800',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 14,
    },
    statCard: {
        flex: 1,
        minHeight: 104,
        borderRadius: 24,
        padding: 18,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#112332',
    },
    statLabel: {
        marginTop: 6,
        fontSize: 14,
        color: '#65717c',
        fontWeight: '700',
    },
    balanceCard: {
        minHeight: 116,
        borderRadius: 28,
        padding: 20,
        backgroundColor: '#AEE7F8',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 26,
    },
    balanceIcon: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceText: {
        flex: 1,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#30404d',
        fontWeight: '700',
    },
    balanceValue: {
        marginTop: 6,
        fontSize: 32,
        fontWeight: '900',
        color: '#112332',
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 22,
        color: '#112332',
        marginBottom: 4,
    },
    optionCard: {
        minHeight: 78,
        borderRadius: 20,
        padding: 14,
        backgroundColor: '#f5f7f9',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#112332',
    },
    optionSubtitle: {
        marginTop: 3,
        fontSize: 13,
        lineHeight: 18,
        color: '#65717c',
    },
    logoutButton: {
        minHeight: 58,
        borderRadius: 29,
        backgroundColor: '#000',
        marginTop: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
});
