import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GroupsScreen from '../screens/groups/GroupsScreen';
import CreateGroupScreen from '../screens/groups/CreateGroupScreen';
import GroupDetailsScreen from '../screens/groups/GroupDetailsScreen';
import AddExpenseModal from '../screens/groups/AddExpenseModal';

const Stack = createNativeStackNavigator();

export default function GroupStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="GroupsList" component={GroupsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'Novo Grupo' }} />
            <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} options={({ route }: any) => ({ title: route.params.groupName })} />
            
            {/* Requisito: Modal de Nova Despesa */}
            <Stack.Screen 
                name="AddExpenseModal" 
                component={AddExpenseModal} 
                options={{ presentation: 'modal', title: 'Registrar Despesa' }} 
            />
        </Stack.Navigator>
    );
}