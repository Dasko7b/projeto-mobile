import Routes from './src/navigations';
import { useFonts, Inter_700Bold, Inter_400Regular } from '@expo-google-fonts/inter';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return <Routes />;
}

