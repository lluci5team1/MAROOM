import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  NotoSans_400Regular,
  NotoSans_600SemiBold,
  NotoSans_700Bold,
} from "@expo-google-fonts/noto-sans";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";

import { useAppFonts } from "../shared/assets/fonts";

export default function RootLayout() {
  const [googleFontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    NotoSans_400Regular,
    NotoSans_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  const [appFontsLoaded] = useAppFonts();

  if (!googleFontsLoaded || !appFontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Slot />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
