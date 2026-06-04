import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { signup } from "../../entities/user/api";
import { saveToken, saveUserId } from "../../shared/api/token";
import { s, vs, ms } from "../../shared/utils/scale";

export default function SignupScreen() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!displayName || !email || !password || !confirm) {
      Alert.alert("Please fill in all fields");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await signup({ email, password, displayName });
      await saveToken(res.token);
      await saveUserId(res.userId);
      router.replace("/onboarding");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Sign up failed. Please try again.";
      Alert.alert("Sign Up Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.logo}>MAROOM</Text>

        <Text style={styles.label}>Display Name</Text>
        <TextInput
          placeholder="Enter your name"
          placeholderTextColor="#AEAEB2"
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your mail"
          placeholderTextColor="#AEAEB2"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter your Password"
          placeholderTextColor="#AEAEB2"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          placeholder="Confirm your Password"
          placeholderTextColor="#AEAEB2"
          secureTextEntry
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
        />

        <TouchableOpacity
          style={[styles.signupButton, loading && { opacity: 0.7 }]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.signupText}>SIGN UP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.backText}>
            Already have an account? <Text style={styles.link}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  inner: {
    flex: 1,
    paddingHorizontal: s(30),
    justifyContent: "center",
  },

  logo: {
    fontSize: ms(42),
    fontWeight: "800",
    color: "#04B0FF",
    textAlign: "center",
    marginBottom: vs(40),
  },

  label: {
    fontSize: ms(14),
    marginTop: vs(15),
    marginBottom: vs(5),
    color: "#1F2937",
    fontFamily: "Poppins_600SemiBold",
  },

  input: {
    borderBottomWidth: 2,
    borderBottomColor: "#04B0FF",
    paddingVertical: vs(8),
    fontFamily: "Poppins_400Regular",
  },

  signupButton: {
    backgroundColor: "#04B0FF",
    paddingVertical: vs(14),
    borderRadius: ms(8),
    marginTop: vs(30),
    alignItems: "center",
  },

  signupText: {
    color: "white",
    fontSize: ms(16),
    fontFamily: "Poppins_600SemiBold",
  },

  backText: {
    textAlign: "center",
    marginTop: vs(20),
    fontFamily: "Poppins_400Regular",
    color: "#6B7280",
  },

  link: {
    color: "#04B0FF",
    fontFamily: "Poppins_600SemiBold",
  },
});
