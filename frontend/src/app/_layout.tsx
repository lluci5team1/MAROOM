import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  NotoSans_400Regular,
  NotoSans_700Bold,
} from "@expo-google-fonts/noto-sans";

import { useAppFonts } from "../shared/assets/fonts";
import { MainLayout } from "../pages/00_main-layout";

export default function RootLayout() {
  const [googleFontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    NotoSans_400Regular,
    NotoSans_700Bold,
  });

  const [appFontsLoaded] = useAppFonts();
  if (!googleFontsLoaded || !appFontsLoaded) {
    return null; // or splash screen
  }

  return <MainLayout />;
}
