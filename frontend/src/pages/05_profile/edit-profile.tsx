import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { getUserId } from "../../shared/api/token";
import { fetchUser } from "../../entities/user/api";

export function EditProfilePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const userId = await getUserId();
        if (userId) {
          const user = await fetchUser(userId);
          setFullName(user.displayName);
          setEmail(user.email);
        }
      } catch {}
    }
    load();
  }, []);

  const handleSave = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color="#14233C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <InputCard
          label="FULL NAME"
          icon="user"
          value={fullName}
          onChangeText={setFullName}
        />
        <InputCard
          label="EMAIL ADDRESS"
          icon="mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <InputCard
          label="PHONE NUMBER"
          icon="phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
          <Feather name="check-circle" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InputCard({
  label,
  icon,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  icon: any;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholderTextColor="#B8C2CC"
        />
        <Feather name={icon} size={20} color="#B8C2CC" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#14233C",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 42,
    paddingBottom: 24,
    gap: 34,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: "#8A96A3",
    letterSpacing: 0.8,
    paddingLeft: 4,
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 22,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#14233C",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  saveButton: {
    backgroundColor: "#00ADEF",
    borderRadius: 50,
    paddingVertical: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#00ADEF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  saveButtonText: {
    color: "#003D57",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});
