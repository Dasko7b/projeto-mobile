import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { AuthStack } from "./AuthStack";
import { AppTabs } from "./AppTabs";
import Loading from "../components/Loading/Loading";

export function RootNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    return (
        <NavigationContainer>
            {user ? <AppTabs /> : <AuthStack />}
        </NavigationContainer>
    );
}