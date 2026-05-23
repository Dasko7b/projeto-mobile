import { AuthProvider } from './src/context/AuthContext';
import { useFonts, Inter_700Bold, Inter_400Regular } from '@expo-google-fonts/inter';
import { RootNavigator } from './src/navigations/RootNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (

    <AuthProvider>

      <RootNavigator />

    </AuthProvider>

  );
}

