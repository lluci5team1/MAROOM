import { useEffect, useMemo, useState } from "react";
import {
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
import { MOCK_PRODUCTS, MOCK_PRODUCT_DETAILS } from "../../entities/product/mockData";
import { getUserId } from "../../shared/api/token";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";
import { invalidateSavedCache } from "../04_saved/ui";

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
  oak: "#C19A6B",
  walnut: "#5C3D2E",
  terracotta: "#C27251",
};

function getColorHex(color: string): string {
  const lowered = color.toLowerCase();
  for (const key of Object.keys(COLOR_MAP)) {
    if (lowered.includes(key)) return COLOR_MAP[key];
  }
  return "#D9D9D9";
}

function getMockProduct(id: string): Product | null {
  const baseId = id.replace(/-[bc]$/, "");
  return MOCK_PRODUCTS.find((p) => p.id === baseId) ?? null;
}

function getMockBaseId(id: string): string {
  return id.replace(/-[bc]$/, "");
}

export function ProductDetailPage() {
  const router = useRouter();
  const { id, data, initialSaved } = useLocalSearchParams<{ id: string; data?: string; initialSaved?: string }>();

  const [product, setProduct] = useState<Product | null>(() => {
    if (data) { try { return JSON.parse(data); } catch {} }
    return null;
  });
  const [loading, setLoading] = useState(!data);
  const [isSaved, setIsSaved] = useState(initialSaved === "true");
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) { setLoading(false); return; }

      // If product data was passed with known saved status, no fetch needed
      if (data) {
        if (initialSaved !== undefined) {
          const currentUserId = await getUserId();
          if (mounted) setUserId(currentUserId ?? null);
        }
        return;
      }

      // No pre-passed data — fetch everything
      setLoading(true);
      const mockProduct = getMockProduct(String(id));
      if (mockProduct) {
        if (mounted) { setProduct(mockProduct); setLoading(false); }
        return;
      }

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
    return () => { mounted = false; };
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
        invalidateSavedCache();
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
    await Share.share({ message: product.productUrl, url: product.productUrl });
  }

  async function handleOpenWebsite() {
    if (!product?.productUrl) return;
    const canOpen = await Linking.canOpenURL(product.productUrl);
    if (canOpen) await Linking.openURL(product.productUrl);
  }

  if (loading) return <LoadingScreen />;

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const baseId = getMockBaseId(String(id));
  const detail = MOCK_PRODUCT_DETAILS[baseId];
  const primaryHex = getColorHex(product.color);
  const colorDots = detail?.colors ?? [primaryHex, "#7A5A42", "#3D3D3D"];
  const specs = detail?.specs ?? [
    { label: "Dimensions", value: "N/A" },
    { label: "Weight", value: "N/A" },
    { label: "Material", value: "N/A" },
  ];
  const description =
    detail?.description ??
    "A beautifully crafted piece designed to elevate your living space with timeless style and quality materials.";

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Image with overlaid controls */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: product.imageUrl || product.productUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Back button top-left */}
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color="#333" />
        </Pressable>

        {/* Share button top-right */}
        <Pressable style={styles.shareButton} onPress={handleShare} hitSlop={8}>
          <Ionicons name="share-social-outline" size={20} color="#333" />
        </Pressable>

        {/* Dot indicators bottom-center */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Heart button bottom-right */}
        <Pressable style={styles.heartButton} onPress={handleToggleSave} hitSlop={8}>
          <Ionicons
            name={isSaved ? "heart" : "heart-outline"}
            size={20}
            color={isSaved ? "#E53935" : "#018ABD"}
          />
        </Pressable>
      </View>

      {/* Brand + Title above the back card */}
      <View style={styles.titleBlock}>
        <View style={styles.brandPriceRow}>
          <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>
          <Text style={styles.price}>{displayPrice}</Text>
        </View>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.category}>{product.category}</Text>
      </View>

      {/* Back card — same size/style as the image card */}
      <View style={styles.backCard}>
        {/* Color row */}
        <View style={styles.specRow}>
          <Text style={styles.specKey}>Color</Text>
          <Text style={styles.specValue}>{product.color.toUpperCase()}</Text>
        </View>
        {specs.map((spec) => (
          <View key={spec.label}>
            <View style={styles.specDivider} />
            <View style={styles.specRow}>
              <Text style={styles.specKey}>{spec.label}</Text>
              <Text style={styles.specValue}>{spec.value.toUpperCase()}</Text>
            </View>
          </View>
        ))}

        {/* Buy Now CTA */}
        <Pressable style={styles.buyButton} onPress={handleOpenWebsite}>
          <Text style={styles.buyButtonText}>Buy Now</Text>
          <Ionicons name="open-outline" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 48 },

  imageWrapper: {
    margin: 16,
    borderRadius: 24,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 340,
    backgroundColor: "#F1F5F9",
  },
  backButton: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  shareButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  dotsRow: {
    position: "absolute",
    bottom: 56,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  dotActive: { backgroundColor: "#fff" },
  heartButton: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },

  titleBlock: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  brandPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  brand: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: "#018ABD",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  price: {
    fontSize: 22,
    color: "#018ABD",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  title: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "PlusJakartaSans_600SemiBold",
    lineHeight: 32,
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "PlusJakartaSans_400Regular",
  },

  // Back card — same margin/radius as imageWrapper
  backCard: {
    margin: 16,
    borderRadius: 24,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    justifyContent: "space-between",
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 20,
  },
  specDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  specKey: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  specValue: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },

  buyButton: {
    marginTop: 32,
    height: 58,
    borderRadius: 30,
    backgroundColor: "#018ABD",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#018ABD",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  errorText: { color: "#444", fontSize: 16, fontFamily: "PlusJakartaSans_400Regular" },
});
