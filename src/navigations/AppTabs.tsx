import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GroupStack } from "./GroupStack";
import ProfileScreen from "../screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator();

export function AppTabs() {

    return (
        <Tab.Navigator>

            <Tab.Screen
                name="Groups"
                component={GroupStack}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
            />

        </Tab.Navigator>
    );
}