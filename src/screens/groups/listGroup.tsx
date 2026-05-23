import { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const courses = [
    {
        id: '1',
        title: 'Comdida na casa do matheus',
        tutor: 'Matheus Silva',
        color: '#AEE7F8',
    },
    {
        id: '2',
        title: 'Praia dos Crias',
        tutor: 'Mauro oruam',
        color: '#F2F56B',
    },
    {
        id: '3',
        title: 'Thiago teste testinho',
        tutor: 'Thiago',
        color: '#9EF0A8',
    },
];

interface ListGroupProps {
    navigation?: any;
}

export default function ListGroup({ navigation }: ListGroupProps) {
    const [groups, setGroups] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const handleGroupPress = (group: any) => {
        if (navigation) {
            navigation.navigate('GroupDetail', { group });
        }
    };

    async function loadGroups() {
        try {
            const response = await fetch(""); //trocar pela url da api
            const data = await response.json();

            setGroups(data);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleRefresh() {
        setRefreshing(true);

        await loadGroups();

        setRefreshing(false);
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={courses}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                contentContainerStyle={{
                    padding: 0,
                    gap: 20,
                }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleGroupPress(item)}
                        style={[
                            styles.card,
                            { backgroundColor: item.color },
                        ]}
                    >
                        <Text style={styles.tutor}>
                            {item.tutor}
                        </Text>

                        <Text style={styles.category}>
                            Racha
                        </Text>

                        <Text style={styles.title}>
                            {item.title}
                        </Text>

                        <Text style={styles.info}>
                            6 participantes
                        </Text>

                        <View style={styles.button}>
                            <Text style={styles.arrow}>
                                ↗
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        flex: 1,
        backgroundColor: 'transparent',
    },

    card: {
        width: '100%',
        height: 220,

        borderRadius: 32,

        padding: 24,

        justifyContent: 'space-between',
    },

    tutor: {
        fontSize: 14,
        fontWeight: '600',
    },

    category: {
        fontSize: 14,
        opacity: 0.6,
    },

    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#000',
    },

    info: {
        fontSize: 14,
    },

    button: {
        position: 'absolute',

        top: 20,
        right: 20,

        width: 42,
        height: 42,

        borderRadius: 999,

        backgroundColor: '#000',

        justifyContent: 'center',
        alignItems: 'center',
    },

    arrow: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});