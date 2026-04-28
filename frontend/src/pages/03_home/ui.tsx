import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SwipeCardDeck } from "../../widgets/swipe-card-stack";
import { fetchFurnitureItems } from "../../entities/product/api";
import { Product } from "../../entities/product/type";
import { MOCK_PRODUCTS } from "../../entities/product/mockData";
import { getUserId } from "../../shared/api/token";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";
import { icons } from "../../shared/assets/icons";

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        //const [data, id] = await Promise.all([fetchFurnitureItems(), getUserId()]);
        //setProducts(data.length > 0 ? data : MOCK_PRODUCTS);
        setProducts(MOCK_PRODUCTS);
        //setUserId(id);
      } catch (error) {
        console.error("Failed to fetch furniture:", error);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

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
          <SwipeCardDeck products={products} userId={userId} />
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
    paddingHorizontal: 24,
    paddingTop:20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  LOGO2: {
    width: 30,
    height: 30,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    color: "#2C84C6",
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.3,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E3F0FA",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 30,
    height: 30,
  },
  deckContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  deckFrame: {
    flex: 1,
    width: "100%",
    maxWidth: 380,
    maxHeight: 680,
  },
});
