import { View, Text, StyleSheet } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";
import { Video, ResizeMode } from "expo-av";

export function SplashPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const isLoggedIn = false; // Replace later with real auth check

      if (isLoggedIn) {
        router.replace("/home");
      }

      router.replace("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>MAROOM</Text>
      <Video
        source={require("../../shared/assets/ball_video.mp4")}
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
    backgroundColor: "#04B0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  video: {
    position: "absolute",
    bottom: 0,
    width: "30%",
    height: "30%",
    alignSelf: "center",
  },
});
