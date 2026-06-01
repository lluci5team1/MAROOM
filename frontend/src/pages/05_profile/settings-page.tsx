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

export function SettingsPage() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color="#14233C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>ACCOUNT</Text>

        <SettingsCard
          icon="lock"
          label="Password"
          showChevron
          onPress={() => {}}
        />

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>PREFERENCES</Text>

        <SettingsCard
          icon="globe"
          label="Language"
          subtitle="English (US)"
          showChevron
          onPress={() => {}}
        />
        <SettingsCard
          icon="moon"
          label="Dark Mode"
          right={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#D1D9E0", true: "#1399E5" }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <Text style={styles.version}>MAROOM V2.4.1 (BUILD 8902)</Text>
      </ScrollView>
    </View>
  );
}

function SettingsCard({
  icon,
  label,
  subtitle,
  showChevron,
  right,
  onPress,
}: {
  icon: any;
  label: string;
  subtitle?: string;
  showChevron?: boolean;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={styles.cardLeft}>
        <View style={styles.iconBg}>
          <Feather name={icon} size={22} color="#5A6675" />
        </View>
        <View>
          <Text style={styles.cardLabel}>{label}</Text>
          {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showChevron && <Feather name="chevron-right" size={22} color="#B8C2CC" />}
      {right}
    </TouchableOpacity>
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
    paddingBottom: 32,
    gap: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: "#8A96A3",
    letterSpacing: 0.8,
    marginBottom: -4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 22,
    shadowColor: "#8A96A3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
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
  version: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "#B8C2CC",
    letterSpacing: 0.6,
    textAlign: "center",
    marginTop: 22,
  },
});
