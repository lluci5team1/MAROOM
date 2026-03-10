import { View, StyleSheet } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import { getToken } from "../../shared/api/token";

export function SplashPage() {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const token = await getToken();

      if (token) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Video
        source={require("../../shared/assets/start_animation.mov")}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
