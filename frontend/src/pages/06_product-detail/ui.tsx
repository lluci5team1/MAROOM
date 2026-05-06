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
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) { setLoading(false); return; }
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

      {/* Content */}
      <View style={styles.content}>
        {/* Brand + Price */}
        <View style={styles.brandPriceRow}>
          <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>
          <Text style={styles.price}>{displayPrice}</Text>
        </View>

        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.category}>{product.category}</Text>

        {/* Color */}
        <Text style={styles.sectionLabel}>COLOR</Text>
        <View style={styles.colorRow}>
          {colorDots.map((hex, i) => (
            <View
              key={i}
              style={[styles.colorDot, { backgroundColor: hex }, i === 0 && styles.colorDotSelected]}
            />
          ))}
        </View>

        {/* Specifications */}
        <View style={styles.specsCard}>
          <Text style={styles.specsTitle}>SPECIFICATIONS</Text>
          {specs.map((spec, i) => (
            <View key={spec.label}>
              {i > 0 && <View style={styles.specDivider} />}
              <View style={styles.specRow}>
                <Text style={styles.specKey}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* The Design */}
        <Text style={styles.sectionLabel}>THE DESIGN</Text>
        <Text style={styles.description}>{description}</Text>

        {/* CTA */}
        <Pressable style={styles.websiteButton} onPress={handleOpenWebsite}>
          <Text style={styles.websiteButtonText}>View on Website</Text>
          <Ionicons name="open-outline" size={17} color="#fff" style={{ marginLeft: 7 }} />
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

  content: { paddingHorizontal: 20 },

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
    fontSize: 26,
    color: "#111827",
    fontFamily: "PlusJakartaSans_600SemiBold",
    lineHeight: 34,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "PlusJakartaSans_400Regular",
    marginBottom: 18,
  },

  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  colorDotSelected: {
    borderWidth: 2.5,
    borderColor: "#018ABD",
  },

  specsCard: {
    backgroundColor: "#F1F5FA",
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    gap: 0,
  },
  specsTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#374151",
    marginBottom: 12,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  specDivider: {
    height: 1,
    backgroundColor: "#DDE3EC",
  },
  specKey: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "PlusJakartaSans_400Regular",
  },
  specValue: {
    fontSize: 14,
    color: "#111827",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },

  description: {
    fontSize: 14,
    color: "#4B5563",
    fontFamily: "PlusJakartaSans_400Regular",
    lineHeight: 22,
    marginBottom: 28,
  },

  websiteButton: {
    height: 54,
    borderRadius: 30,
    backgroundColor: "#018ABD",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  websiteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  errorText: { color: "#444", fontSize: 16, fontFamily: "PlusJakartaSans_400Regular" },
});
