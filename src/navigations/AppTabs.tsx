import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Users, Receipt, UserCircle } from 'lucide-react-native';
import GroupStack from './GroupStack'; 
import ActivityScreen from '../screens/activity/ActivityScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
    return (
        <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#007AFF', headerShown: true }}>
            <Tab.Screen 
                name="GruposTab" 
                component={GroupStack} 
                options={{ title: 'Meus Grupos', tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }} 
            />
            <Tab.Screen 
                name="AtividadeTab" 
                component={ActivityScreen} 
                options={{ title: 'Extrato', tabBarIcon: ({ color, size }) => <Receipt color={color} size={size} /> }} 
            />
            <Tab.Screen 
                name="PerfilTab" 
                component={ProfileScreen} 
                options={{ title: 'Meu Perfil', tabBarIcon: ({ color, size }) => <UserCircle color={color} size={size} /> }} 
            />
        </Tab.Navigator>
    );
}