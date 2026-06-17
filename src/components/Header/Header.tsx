
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { styles } from '../../styles/components/Header.styles';

export default function Header() {
    return (

        <View style={styles.header}>
            <Text style={styles.logo}>FechaConta</Text>

            <TouchableOpacity style={styles.profileButton}>
                <Image
                    source={{
                        uri: 'https://i.pravatar.cc/150?img=12',
                    }}
                    style={styles.avatar}
                />

                <View style={styles.onlineIndicator} />
            </TouchableOpacity>
        </View>

    );
}
