import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { icons } from "../../shared/assets/icons";
import { useRouter } from "expo-router";
import { login, googleLogin } from "../../entities/user/api";
import { saveToken, saveUserId, saveOnboardingFlag } from "../../shared/api/token";
import { s, vs, ms } from "../../shared/utils/scale";

const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleToken = useCallback(async (idToken: string) => {
    const res = await googleLogin(idToken);
    await saveToken(res.token);
    await saveUserId(res.userId);
    await saveOnboardingFlag(res.hasCompletedOnboarding);
    if (res.hasCompletedOnboarding) {
      router.replace("/home");
    } else {
      router.replace("/onboarding");
    }
  }, [router]);

  const handleLogin = async () => {
    if (!agree) {
      Alert.alert("Please agree to the Terms & Conditions");
      return;
    }
    if (!email || !password) {
      Alert.alert("Please enter your email and password");
      return;
    }
    try {
      setLoading(true);
      const res = await login({ email, password });
      await saveToken(res.token);
      await saveUserId(res.userId);
      await saveOnboardingFlag(res.hasCompletedOnboarding);
      if (res.hasCompletedOnboarding) {
        router.replace("/home");
      } else {
        router.replace("/onboarding");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Login failed. Please try again.";
      Alert.alert("Login Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.logo}>MAROOM</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your mail"
          placeholderTextColor="#AEAEB2"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter your Password"
          placeholderTextColor="#AEAEB2"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={[styles.checkbox, agree && { backgroundColor: "#04B0FF" }]}
            onPress={() => setAgree(!agree)}
          >
            {agree && <Ionicons name="checkmark" size={14} color="white" />}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I agree with <Text style={styles.link}>Terms & Conditions</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginText}>LOGIN</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.signupText}>SIGN UP</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>

        {IOS_CLIENT_ID ? (
          <GoogleSignInButton
            iosClientId={IOS_CLIENT_ID}
            onGoogleToken={handleGoogleToken}
          />
        ) : (
          <TouchableOpacity style={[styles.socialButton, { opacity: 0.6 }]} disabled>
            <Image source={icons.google} style={{ width: 18, height: 18 }} />
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Contact</Text>
          <Text style={styles.footerText}> | </Text>
          <Text style={styles.footerText}>Terms of Service</Text>
          <Text style={styles.footerText}> | </Text>
          <Text style={styles.footerText}>Privacy Policy</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function GoogleSignInButton({
  iosClientId,
  onGoogleToken,
}: {
  iosClientId: string;
  onGoogleToken: (idToken: string) => Promise<void>;
}) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId,
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        void (async () => {
          try {
            await onGoogleToken(idToken);
          } catch (err: any) {
            const message =
              err?.response?.data?.message ?? "Google login failed. Please try again.";
            Alert.alert("Google Login Error", message);
          } finally {
            setGoogleLoading(false);
          }
        })();
      } else {
        Alert.alert("Google Sign-In Error", "Could not retrieve ID token.");
        setGoogleLoading(false);
      }
    } else if (response?.type === "error") {
      Alert.alert("Google Sign-In Error", response.error?.message ?? "Unknown error");
      setGoogleLoading(false);
    } else if (response?.type === "dismiss") {
      setGoogleLoading(false);
    }
  }, [response, onGoogleToken]);

  return (
    <TouchableOpacity
      style={[styles.socialButton, (googleLoading || !request) && { opacity: 0.6 }]}
      disabled={googleLoading || !request}
      onPress={() => {
        setGoogleLoading(true);
        void promptAsync();
      }}
    >
      {googleLoading ? (
        <ActivityIndicator size="small" color="#1F2937" />
      ) : (
        <>
          <Image source={icons.google} style={{ width: 18, height: 18 }} />
          <Text style={styles.socialText}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: vs(20),
  },
  checkbox: {
    width: s(20),
    height: s(20),
    borderWidth: 1,
    borderColor: "#04B0FF",
    marginRight: s(8),
    justifyContent: "center",
    alignItems: "center",
  },
  termsText: {
    fontSize: ms(13),
    fontFamily: "Poppins_400Regular",
  },
  link: {
    color: "#0088FF",
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#04B0FF",
    paddingVertical: vs(14),
    borderRadius: ms(8),
    marginTop: vs(25),
    alignItems: "center",
  },
  loginText: {
    color: "white",
    fontSize: ms(16),
    fontFamily: "Poppins_600SemiBold",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: vs(20),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  or: {
    marginHorizontal: s(10),
    color: "#BFBFBF",
    fontFamily: "Poppins_400Regular",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: vs(12),
    borderRadius: ms(8),
    marginVertical: vs(6),
  },
  socialText: {
    marginLeft: s(10),
    fontSize: ms(14),
    color: "#1F2937",
    fontFamily: "Poppins_400Regular",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: vs(25),
  },
  footerText: {
    fontSize: ms(12),
    fontFamily: "Poppins_400Regular",
    color: "#AEAEB2",
  },
  signupButton: {
    borderWidth: 2,
    borderColor: "#04B0FF",
    paddingVertical: vs(14),
    borderRadius: ms(8),
    marginTop: vs(10),
    alignItems: "center",
  },
  signupText: {
    color: "#04B0FF",
    fontSize: ms(16),
    fontFamily: "Poppins_600SemiBold",
  },
});
