import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getUserId } from "../../shared/api/token";
import { fetchUser, updateUserProfile } from "../../entities/user/api";
import {
  safeImageUri,
  safeProfileAvatarUrl,
  safeProfilePicturePayload,
} from "../../shared/utils/safeImageUri";

export function EditProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [displayUri, setDisplayUri] = useState<string | null>(null);
  const pendingPictureRef = useRef<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const id = await getUserId();
        setUserId(id);
        if (id) {
          const user = await fetchUser(id);
          setFullName(user.displayName);
          setEmail(user.email);
          setDisplayUri(safeProfileAvatarUrl(user.profilePictureUrl));
          pendingPictureRef.current = undefined;
        }
      } catch {}
    }
    load();
  }, []);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setDisplayUri(safeImageUri(asset.uri));
      const payload = asset.base64
        ? safeProfilePicturePayload(`data:image/jpeg;base64,${asset.base64}`)
        : undefined;
      if (asset.base64 && !payload) {
        Alert.alert("Photo too large", "Please choose a smaller image.");
        pendingPictureRef.current = undefined;
        return;
      }
      pendingPictureRef.current = payload;
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updateUserProfile(userId, {
        displayName: fullName,
        ...(pendingPictureRef.current !== undefined
          ? { profilePictureUrl: pendingPictureRef.current }
          : {}),
      });
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color="#14233C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile picture picker */}
        <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickImage} activeOpacity={0.8}>
          {displayUri ? (
            <Image source={{ uri: displayUri }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={60} color="#9BAAB8" />
            </View>
          )}
          <View style={styles.cameraButton}>
            <Feather name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.changePhotoLabel}>Tap to change photo</Text>

        <InputCard label="FULL NAME" icon="user" value={fullName} onChangeText={setFullName} />
        <InputCard
          label="EMAIL ADDRESS"
          icon="mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={false}
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
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#003D57" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>Save Changes</Text>
              <Feather name="check-circle" size={20} color="#003D57" />
            </>
          )}
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
  editable = true,
}: {
  label: string;
  icon: any;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  autoCapitalize?: any;
  editable?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputCard, !editable && styles.inputCardDisabled]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholderTextColor="#B8C2CC"
          editable={editable}
        />
        <Feather name={icon} size={20} color={editable ? "#B8C2CC" : "#D5DCE3"} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_600SemiBold", color: "#14233C" },
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
  },
  avatarWrapper: { position: "relative" },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#E4EAEF" },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E4EAEF",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#00ADEF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FDFDFD",
  },
  changePhotoLabel: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#8A96A3",
    marginTop: -16,
  },
  fieldGroup: { gap: 8, width: "100%" },
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
  inputCardDisabled: { backgroundColor: "#F8F9FA" },
  input: { flex: 1, fontSize: 16, fontFamily: "Poppins_400Regular", color: "#14233C" },
  footer: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 },
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
  saveButtonText: { color: "#003D57", fontSize: 16, fontFamily: "Poppins_600SemiBold" },
});
