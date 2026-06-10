import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Users, User, ReceiptText } from "lucide-react-native";
import { GroupStack } from "./GroupStack";
import ProfileScreen from "../screens/profile/ProfileScreen";
import ActivityScreen from "../screens/activity/ActivityScreen";

const Tab = createBottomTabNavigator();

export function AppTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "#2563eb",
                tabBarInactiveTintColor: "#777",
                tabBarIcon: ({ color, size }) => {
                    if (route.name === "Meus Grupos") {
                        return <Users color={color} size={size} />;
                    }
                    if (route.name === "Atividade") {
                        return <ReceiptText color={color} size={size} />;
                    }
                    if (route.name === "Perfil") {
                        return <User color={color} size={size} />;
                    }
                },
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: "#e5e7eb",
                    backgroundColor: "#ffffff",
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                }
            })}
        >
            <Tab.Screen
                name="Meus Grupos"
                component={GroupStack}
            />
            <Tab.Screen
                name="Atividade"
                component={ActivityScreen}
            />
            <Tab.Screen
                name="Perfil"
                component={ProfileScreen}
            />
        </Tab.Navigator>
    );
}