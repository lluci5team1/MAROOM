import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { icons } from "../assets/icons";

export function LoadingScreen() {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={icons.new_spinner}
        style={[styles.spinner, { transform: [{ rotate: spin }] }]}
        resizeMode="contain"
      />
      <Text style={styles.title}>Loading...</Text>
      <Text style={styles.subtitle}>Please wait</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  spinner: {
    width: 72,
    height: 72,
  },
  title: {
    marginTop: 10,
    fontSize: 26,
    color: "#15233B",
    fontFamily: "Poppins_600SemiBold",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#4A5568",
    fontFamily: "Poppins_300Light",
  },
});
