import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SwipeCardDeck } from "../../widgets/swipe-card-stack";
import { fetchFeed, fetchFurnitureItems } from "../../entities/product/api";
import { Product } from "../../entities/product/type";
import { MOCK_PRODUCTS } from "../../entities/product/mockData";
import { getUserId } from "../../shared/api/token";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";
import { s, vs, ms } from "../../shared/utils/scale";
import { icons } from "../../shared/assets/icons";

const HOME_FEED_PAGE_SIZE = 10;

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const id = await getUserId();
        setUserId(id);
        const data = id
          ? await fetchFeed(id, HOME_FEED_PAGE_SIZE)
          : await fetchFurnitureItems();
        setProducts(data.length > 0 ? data : MOCK_PRODUCTS);
      } catch (error) {
        console.error("Failed to fetch furniture:", error);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleLoadMore = useCallback(async () => {
    try {
      return userId
        ? await fetchFeed(userId, HOME_FEED_PAGE_SIZE)
        : await fetchFurnitureItems();
    } catch {
      return [];
    }
  }, [userId]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Image source={icons.LOGO2} style={styles.LOGO2} resizeMode="contain" />
          <Text style={styles.title}>MAROOM</Text>
        </View>
      </View>

      <View style={styles.deckContainer}>
        <View style={styles.deckFrame}>
          <SwipeCardDeck products={products} userId={userId} onLoadMore={handleLoadMore} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: s(24),
    paddingTop: vs(20),
    paddingBottom: vs(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: vs(8),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(8),
  },
  LOGO2: {
    width: s(30),
    height: s(30),
  },
  title: {
    fontSize: ms(30),
    lineHeight: ms(36),
    color: "#2C84C6",
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.3,
  },
  logoBadge: {
    width: s(52),
    height: s(52),
    borderRadius: ms(26),
    backgroundColor: "#E3F0FA",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: s(30),
    height: s(30),
  },
  deckContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: s(16),
    paddingBottom: vs(12),
  },
  deckFrame: {
    flex: 1,
    width: "100%",
    maxWidth: s(380),
    maxHeight: vs(680),
  },
});
