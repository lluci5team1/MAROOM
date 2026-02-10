import { useFonts } from "expo-font";

export function useAppFonts() {
  return useFonts({
    Sansation_400Regular: require("./Sansation/Sansation-Regular.ttf"),
    Sansation_700Bold: require("./Sansation/Sansation-Bold.ttf"),
  });
}
