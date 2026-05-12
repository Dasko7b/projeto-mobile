import { View, Text, StyleSheet, TouchableOpacity, FlatList, ImageBackground } from 'react-native';
import { ArrowLeft, CreditCard, DollarSign, Plus } from 'lucide-react-native';

interface GroupData {
    id: string;
    title: string;
    tutor: string;
    color: string;
}

const friends = [
    {
        id: '1',
        name: 'Add Friend',
        add: true,
    },
    {
        id: '2',
        name: 'Adams',
        image:
            'https://i.pravatar.cc/150?img=1',
    },
    {
        id: '3',
        name: 'Ross',
        image:
            'https://i.pravatar.cc/150?img=2',
    },
    {
        id: '4',
        name: 'Keith',
        image:
            'https://i.pravatar.cc/150?img=3',
    },
    {
        id: '5',
        name: 'Laila',
        image:
            'https://i.pravatar.cc/150?img=4',
    },
];


export default function GroupDetailScreen({ route, navigation }: any) {
    const { group } = route.params as { group: GroupData };
    const totalDivida = 1000;
    const dividaAtual = 350;
    const totalPago = 650;
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>{group.title}</Text>
            </View>
            <FlatList
                data={friends}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        {item.add ? (
                            <TouchableOpacity style={styles.addButton}>
                                <Text style={styles.plus}>+</Text>
                            </TouchableOpacity>
                        ) : (
                            <ImageBackground
                                source={{ uri: item.image }}
                                style={styles.img}
                                imageStyle={styles.avatar}
                            >
                            </ImageBackground>
                        )}
                    </View>
                )}
            />

            <View style={styles.cardB}>
                {/* Header */}
                <Text style={styles.label}>Saldo da Dívida</Text>

                <Text style={styles.value}>
                    R$ {totalDivida.toFixed(2)}
                </Text>

                {/* Informações */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Dívida Atual</Text>
                        <Text style={styles.infoValue}>
                            R$ {dividaAtual}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Total Pago</Text>
                        <Text style={styles.infoValue}>
                            R$ {totalPago}
                        </Text>
                    </View>
                </View>

                {/* Ações */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Plus size={22} color="#222" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <DollarSign size={22} color="#222" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <CreditCard size={22} color="#222" />
                    </TouchableOpacity>
                </View>

                {/* Labels das ações */}
                <View style={styles.actionLabels}>
                    <Text style={styles.actionText}>Adicionar</Text>
                    <Text style={styles.actionText}>Pagar</Text>
                    <Text style={styles.actionText}>Histórico</Text>
                </View>
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 23,
        marginVertical: 0,
        justifyContent: 'flex-start',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    img: {
        width: 60,
        height: 60,
    },



    sectionTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 20,
        color: '#112332',
        marginBottom: 10,
    },




    list: {
        paddingVertical: 15,
        gap: 7,
        paddingLeft: 5
    },

    item: {
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
    },

    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },

    addButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 0,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
    },

    plus: {
        fontSize: 28,
        fontWeight: 'bold',
    },

    cardB: {
        width: '100%',
        backgroundColor: '#f4f4f4',
        borderRadius: 28,
        padding: 24,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 6,
    },

    label: {
        fontSize: 15,
        color: '#666',
        marginBottom: 10,
    },

    value: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#111',
    },

    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
    },

    infoBox: {
        flex: 1,
        alignItems: 'center',
    },

    divider: {
        width: 1,
        backgroundColor: '#ddd',
        marginHorizontal: 10,
    },

    infoLabel: {
        fontSize: 13,
        color: '#777',
        marginBottom: 6,
    },

    infoValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111',
    },

    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 28,
    },

    actionButton: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#e8ecec',
        justifyContent: 'center',
        alignItems: 'center',
    },

    actionLabels: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },

    actionText: {
        fontSize: 12,
        color: '#555',
    },
});
