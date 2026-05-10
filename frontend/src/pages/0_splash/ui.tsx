import { View, Text, StyleSheet } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import { getToken } from "../../shared/api/token";

export function SplashPage() {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const token = await getToken();

      // TODO: remove — temporary to preview analyzing animation
      router.replace("/analyzing");
      return;

      if (token) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
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
