import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import {
    Users,
    User
} from "lucide-react-native";

import { GroupStack } from "./GroupStack";
import ProfileScreen from "../screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator();

export function AppTabs() {

    return (

        <Tab.Navigator

            screenOptions={({ route }) => ({

                headerShown: false,

                tabBarActiveTintColor: "#2563eb",

                tabBarInactiveTintColor: "#777",

                tabBarIcon: ({
                    color,
                    size
                }) => {

                    if (route.name === "Grupos") {

                        return (

                            <Users
                                color={color}
                                size={size}
                            />

                        );

                    }

                    if (route.name === "Perfil") {

                        return (

                            <User
                                color={color}
                                size={size}
                            />

                        );

                    }

                }

            })}

        >

            <Tab.Screen
                name="Grupos"
                component={GroupStack}
            />

            <Tab.Screen
                name="Perfil"
                component={ProfileScreen}
            />

        </Tab.Navigator>

    );
}