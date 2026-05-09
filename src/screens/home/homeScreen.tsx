import { Flame, LayersPlus, Navigation } from 'lucide-react-native';
import { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ListGroup from '../group/listGroup';
import { ScrollView } from 'react-native-gesture-handler';

export default function HomeScreen({ navigation }: any) {
    const [list, setLists] = useState(true);

    function handleNavigate() {
        navigation.navigate('CreateGroup');
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.title}>
                Rache, controle e pague!
                <Flame size={55} color="#ff0000" fill="#ff0000" />
            </Text>

            {list && <ListGroup />}


            <ImageBackground
                source={require('../../../assets/fechacontahome.jpg')}
                style={styles.card}
                imageStyle={styles.cardImage}
            >
                <View style={styles.overlay}>
                    <Text style={styles.subtitle}>Criar um novo Racha?</Text>
                    <TouchableOpacity style={styles.button} onPress={() => handleNavigate()}>
                        <LayersPlus size={33} color="#0044ff" fill="#0044ff" />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    content: {
        padding: 24,
        gap: 32,
        paddingBottom: 120,
    },
    
    title: {
        fontFamily: 'Inter_700Bold',
        fontSize: 58,
        color: '#112332'
    },
    subtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 48,
        color: '#ffffff'
    },
    card: {
        width: '100%',
        height: 300,
        borderRadius: 8,
        overflow: 'hidden',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    overlay: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    cardText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 24,
        color: '#00ff95',
        textAlign: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        height: 60,
        width: 60,
        borderRadius: '100%',
        alignItems: 'center',
    },

    buttonText: {
        color: '#000000',
        fontWeight: '700',
    },
});