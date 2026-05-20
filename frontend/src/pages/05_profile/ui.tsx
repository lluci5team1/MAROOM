import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { removeToken, removeUserId, getUserId } from "../../shared/api/token";
import { apiClient } from "../../shared/api/client";
import { fetchUser } from "../../entities/user/api";

export function ProfilePage() {
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const userId = await getUserId();
        if (userId) {
          const user = await fetchUser(userId);
          setDisplayName(user.displayName);
          setEmail(user.email);
        }
      } catch {}
    }
    load();
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {}
    await removeToken();
    await removeUserId();
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      {/* Header */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={72} color="#9BAAB8" />
          </View>
          <TouchableOpacity
            style={styles.editBadge}
            onPress={() => router.push("/edit-profile" as any)}
          >
            <Feather name="edit-2" size={13} color="#1399E5" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{email}</Text>

        {/* Menu Cards */}
        <View style={styles.menuSection}>
          <MenuCard
            icon="user"
            label="Profile"
            onPress={() => router.push("/edit-profile" as any)}
          />
          <MenuCard
            icon="settings"
            label="Settings"
            onPress={() => router.push("/settings" as any)}
          />
          <MenuCard
            icon="bell"
            label="Notifications"
            showDot
            onPress={() => router.push("/notifications-settings" as any)}
          />
          <MenuCard
            icon="log-out"
            label="Logout"
            isLogout
            onPress={() => setLogoutVisible(true)}
          />
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setLogoutVisible(false)}
        >
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to log out?
            </Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setLogoutVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function MenuCard({
  icon,
  label,
  showDot,
  isLogout,
  onPress,
}: {
  icon: any;
  label: string;
  showDot?: boolean;
  isLogout?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.menuCard}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.iconBg, isLogout && styles.iconBgLogout]}>
          <Feather
            name={icon}
            size={22}
            color={isLogout ? "#E53E3E" : "#5A6675"}
          />
        </View>
        <Text style={[styles.menuLabel, isLogout && styles.menuLabelLogout]}>
          {label}
        </Text>
      </View>
      {!isLogout && (
        <View style={styles.menuRight}>
          {showDot && <View style={styles.notifDot} />}
          <Feather name="chevron-right" size={22} color="#B8C2CC" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },
  content: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },

  // Avatar
  avatarWrapper: {
    position: "relative",
    marginBottom: 20,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#E4EAEF",
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E4EAEF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // User info
  userName: {
    fontSize: 26,
    fontFamily: "Poppins_700Bold",
    color: "#14233C",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#8A96A3",
    marginBottom: 36,
  },

  // Menu
  menuSection: {
    width: "100%",
    gap: 14,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#8A96A3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBgLogout: {
    backgroundColor: "#FDECEA",
  },
  menuLabel: {
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
    color: "#14233C",
  },
  menuLabelLogout: {
    color: "#E53E3E",
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1399E5",
  },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#14233C",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#8A96A3",
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: "#C0392B",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  cancelButton: {
    backgroundColor: "#F0F2F5",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#14233C",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
});
