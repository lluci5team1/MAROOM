import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

export function NotFoundPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.subtitle}>Oops.. Something went wrong..</Text>
      <Pressable style={styles.button} onPress={() => router.replace("/(main)/home")}>
        <Text style={styles.buttonText}>HOME</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    gap: 12,
    marginBottom: 40,
  },
  code: {
    fontSize: 60,
    fontWeight: "800",
    color: "#018ABD",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#D9D9D9",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    letterSpacing: 1,
  },
});
