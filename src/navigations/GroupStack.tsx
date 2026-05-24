import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupsScreen from "../screens/groups/GroupsScreen";
import GroupDetailsScreen from "../screens/groups/GroupDetailsScreen";
import AddExpenseModal from "../screens/groups/AddExpenseModal";
import CreateGroupScreen from "../screens/groups/createGroupForm";


const Stack = createNativeStackNavigator();

export function GroupStack() {

    return (

        <Stack.Navigator screenOptions={{ headerShown: false }}>

            <Stack.Screen
                name="GroupsScreen"
                component={GroupsScreen}
            />

            <Stack.Screen
                name="CreateGroup"
                component={CreateGroupScreen}
            />

            <Stack.Screen
                name="GroupDetails"
                component={GroupDetailsScreen}
            />

            <Stack.Screen
                name="AddExpense"
                component={AddExpenseModal}
                options={{
                    presentation: "modal"
                }}
            />

        </Stack.Navigator>
    );
}
