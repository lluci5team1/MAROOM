import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export function NotificationsPage() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color="#14233C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <NotifRow
          icon="bell"
          label="Push Notifications"
          subtitle="Instant updates on your mobile device"
          value={pushEnabled}
          onValueChange={setPushEnabled}
        />
        <NotifRow
          icon="mail"
          label="Email Alerts"
          subtitle="Daily digest and account activity"
          value={emailEnabled}
          onValueChange={setEmailEnabled}
        />
      </ScrollView>
    </View>
  );
}

function NotifRow({
  icon,
  label,
  subtitle,
  value,
  onValueChange,
}: {
  icon: any;
  label: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBg}>
        <Feather name={icon} size={22} color="#5A6675" />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D1D9E0", true: "#1399E5" }}
        thumbColor="#FFFFFF"
      />
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
    paddingTop: 16,
    gap: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 22,
    gap: 16,
    shadowColor: "#8A96A3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
    color: "#14233C",
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#8A96A3",
    marginTop: 2,
  },
});
