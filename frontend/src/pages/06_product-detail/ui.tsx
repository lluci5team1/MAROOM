import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  fetchFurnitureItem,
  fetchSavedProducts,
  saveProductForUser,
  unsaveProductForUser,
} from "../../entities/product/api";
import { Product } from "../../entities/product/type";
import { getUserId } from "../../shared/api/token";

const COLOR_MAP: Record<string, string> = {
  black: "#222222",
  white: "#F2F2F2",
  gray: "#8A8A8A",
  grey: "#8A8A8A",
  brown: "#7A5A42",
  blue: "#2778C4",
  red: "#B83A3A",
  green: "#3D8B57",
  beige: "#D8C7A1",
};

function getColorHex(color: string): string {
  const lowered = color.toLowerCase();
  for (const key of Object.keys(COLOR_MAP)) {
    if (lowered.includes(key)) return COLOR_MAP[key];
  }
  return "#D9D9D9";
}

export function ProductDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7401/ingest/2fe98e00-895c-40f0-a2aa-b86b1918cc6a", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "1e43da",
      },
      body: JSON.stringify({
        sessionId: "1e43da",
        runId: "route-debug-1",
        hypothesisId: "H3",
        location: "pages/06_product-detail/ui.tsx:load",
        message: "product detail load effect",
        data: { id: id ? String(id) : null },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    let mounted = true;

    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [furniture, currentUserId] = await Promise.all([
          fetchFurnitureItem(String(id)),
          getUserId(),
        ]);

        if (!mounted) return;
        setProduct(furniture);
        setUserId(currentUserId);

        if (currentUserId) {
          const savedItems = await fetchSavedProducts(currentUserId);
          if (!mounted) return;
          setIsSaved(savedItems.some((item) => item.id === String(id)));
        }
      } catch (error) {
        console.log("[ProductDetail] load failed:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const displayPrice = useMemo(() => {
    if (!product) return "";
    return `$${product.price.toFixed(2)}`;
  }, [product]);

  async function handleToggleSave() {
    if (!product || !userId || saving) return;
    setSaving(true);
    try {
      if (isSaved) {
        await unsaveProductForUser(userId, product.id);
        setIsSaved(false);
      } else {
        await saveProductForUser(userId, product.id);
        setIsSaved(true);
      }
    } catch (error) {
      console.log("[ProductDetail] toggle save failed:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    if (!product?.productUrl) return;
    await Share.share({
      message: product.productUrl,
      url: product.productUrl,
    });
  }

  async function handleOpenWebsite() {
    if (!product?.productUrl) return;
    const canOpen = await Linking.canOpenURL(product.productUrl);
    if (canOpen) {
      await Linking.openURL(product.productUrl);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#018ABD" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topActions}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </Pressable>
        <Pressable onPress={handleShare} hitSlop={10}>
          <Ionicons name="share-social-outline" size={24} color="#111" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: product.imageUrl || product.productUrl }}
            style={styles.image}
            resizeMode="cover"
          />

          <Pressable
            style={styles.heartButton}
            onPress={handleToggleSave}
            disabled={saving || !userId}
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={22}
              color={isSaved ? "#018ABD" : "#111"}
            />
          </Pressable>
        </View>

        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.price}>{displayPrice}</Text>

        <View style={styles.colorRow}>
          <View
            style={[
              styles.colorDot,
              styles.selectedDot,
              { backgroundColor: getColorHex(product.color) },
            ]}
          />
          <View style={[styles.colorDot, { backgroundColor: "#B4B4B4" }]} />
          <View style={[styles.colorDot, { backgroundColor: "#D9D9D9" }]} />
        </View>

        <Text style={styles.colorText}>
          Color: <Text style={styles.colorValue}>{product.color}</Text>
        </Text>

        <Pressable style={styles.infoRow}>
          <Text style={styles.infoText}>Product details</Text>
          <Ionicons name="chevron-down" size={20} color="#7B7B7B" />
        </Pressable>
        <View style={styles.separator} />

        <Pressable style={styles.infoRow}>
          <Text style={styles.infoText}>Measurements</Text>
          <Ionicons name="chevron-down" size={20} color="#7B7B7B" />
        </Pressable>

        <Pressable style={styles.websiteButton} onPress={handleOpenWebsite}>
          <Text style={styles.websiteButtonText}>View on Website</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topActions: {
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 290,
    borderRadius: 12,
    backgroundColor: "#E7E7E7",
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFFD9",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 10,
    fontSize: 22,
    lineHeight: 28,
    color: "#2A2A2A",
    fontFamily: "Poppins_600SemiBold",
  },
  category: {
    marginTop: 6,
    fontSize: 13,
    color: "#6A6A6A",
    fontFamily: "Poppins_300Light",
  },
  price: {
    marginTop: 6,
    fontSize: 30,
    color: "#2A2A2A",
    fontFamily: "Poppins_600SemiBold",
  },
  colorRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 10,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  selectedDot: {
    borderWidth: 2,
    borderColor: "#00AEEF",
  },
  colorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#2E2E2E",
    fontFamily: "Poppins_300Light",
  },
  colorValue: {
    fontFamily: "Poppins_600SemiBold",
  },
  infoRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoText: {
    fontSize: 22,
    color: "#2D2D2D",
    fontFamily: "Poppins_300Light",
  },
  separator: {
    marginTop: 8,
    borderBottomColor: "#DCDCDC",
    borderBottomWidth: 1,
  },
  websiteButton: {
    marginTop: 14,
    marginBottom: 0,
    height: 48,
    borderRadius: 28,
    backgroundColor: "#078FC1",
    justifyContent: "center",
    alignItems: "center",
  },
  websiteButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    color: "#444",
    fontSize: 16,
    fontFamily: "Poppins_300Light",
  },
});
