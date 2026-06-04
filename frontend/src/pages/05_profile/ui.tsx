import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  removeToken,
  removeUserId,
  getProfileCache,
  clearProfileCache,
} from "../../shared/api/token";
import { apiClient } from "../../shared/api/client";

export function ProfilePage() {
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  // Read cached profile only — never call GET /users/{id} here. That endpoint
  // previously returned multi-MB base64 strings which crashed Hermes on iOS
  // Release when axios parsed/logged the response (TurboModule → NSException).
  useEffect(() => {
    let cancelled = false;
    getProfileCache().then((cached) => {
      if (cancelled || !cached) return;
      setDisplayName(cached.displayName);
      setEmail(cached.email);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {}
    await removeToken();
    await removeUserId();
    await clearProfileCache();
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
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

        <Text style={styles.userName}>{displayName || "Profile"}</Text>
        <Text style={styles.userEmail}>{email}</Text>

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

      {logoutVisible && (
        <View style={styles.logoutOverlay} pointerEvents="box-none">
          <Pressable
            style={styles.backdrop}
            onPress={() => setLogoutVisible(false)}
          >
            <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
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
            </View>
          </Pressable>
        </View>
      )}
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
    overflow: "hidden",
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
  logoutOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
  },
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
