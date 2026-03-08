import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export function ProfilePage() {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>My Page</Text>

      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#ffffff" />
        </View>

        <View>
          <Text style={styles.userName}>User name</Text>
          <Text style={styles.userEmail}>username@gmail.com</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Menu Items */}

      <MenuItem icon="user" text="My Profile" />
      <MenuItem icon="settings" text="Settings" />
      <MenuItem icon="bell" text="Notification" rightText="Allow" />
      <MenuItem icon="log-out" text="Log Out" />

      {/* TEMP: 404 테스트 버튼 */}
      <TouchableOpacity style={styles.tempButton} onPress={() => router.push("/test-404" as any)}>
        <Text style={styles.tempButtonText}>[ TEMP ] Not Found 테스트</Text>
      </TouchableOpacity>
    </View>
  );
}

function MenuItem({
  icon,
  text,
  rightText,
}: {
  icon: any;
  text: string;
  rightText?: string;
}) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <View style={styles.menuLeft}>
        <Feather name={icon} size={22} color="#444" />
        <Text style={styles.menuText}>{text}</Text>
      </View>

      <View style={styles.menuRight}>
        {rightText && <Text style={styles.rightText}>{rightText}</Text>}
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 70,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 32,
    marginBottom: 30,
    fontFamily: "NotoSans_600SemiBold",
  },

  userSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#e3ebef",
    justifyContent: "center",
    alignItems: "center",
  },

  userName: {
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
  },

  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 3,
    fontFamily: "Roboto_400Regular",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 25,
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  menuText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },

  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  rightText: {
    fontSize: 14,
    color: "#6b7280",
  },

  tempButton: {
    marginTop: 32,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },

  tempButtonText: {
    fontSize: 13,
    color: "#aaa",
  },
});
