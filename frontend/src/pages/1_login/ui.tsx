import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { icons } from "../../shared/assets/icons";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Logo */}
        <Text style={styles.logo}>MAROOM</Text>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your mail"
          placeholderTextColor="#AEAEB2"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter your Password"
          placeholderTextColor="#AEAEB2"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        {/* Terms */}
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

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.loginText}>LOGIN</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>

        {/* Social Buttons */}
        <TouchableOpacity style={styles.socialButton}>
          <Image source={icons.google} style={{ width: 18, height: 18 }} />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="apple" size={18} />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="facebook" size={18} color="#1877F2" />
          <Text style={styles.socialText}>Continue with Facebook</Text>
        </TouchableOpacity>

        {/* Footer */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  logo: {
    fontSize: 42,
    fontWeight: "800",
    color: "#04B0FF",
    textAlign: "center",
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    marginTop: 15,
    marginBottom: 5,
    color: "#1F2937",
    fontFamily: "Poppins_600SemiBold",
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: "#04B0FF",
    paddingVertical: 8,
    fontFamily: "Poppins_400Regular",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#04B0FF",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  termsText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
  link: {
    color: "#0088FF",
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#04B0FF",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 25,
    alignItems: "center",
  },
  loginText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold", // 👈 use bold version
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  or: {
    marginHorizontal: 10,
    color: "#BFBFBF",
    fontFamily: "Poppins_400Regular",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  socialText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#1F2937",
    fontFamily: "Poppins_400Regular",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#AEAEB2",
  },
});
