import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SwipeCardDeck } from "../../widgets/swipe-card-stack";
import { fetchFeed, fetchFurnitureItems } from "../../entities/product/api";
import { Product } from "../../entities/product/type";
import { MOCK_PRODUCTS } from "../../entities/product/mockData";
import { getUserId } from "../../shared/api/token";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";
import { s, vs, ms } from "../../shared/utils/scale";
import { icons } from "../../shared/assets/icons";

const HOME_FEED_PAGE_SIZE = 10;

let _cachedFeed: Product[] = [];
let _cachedUserId: string | null = null;
let _cachedCanGoBack = false;

export function HomePage() {
  const [products, setProducts] = useState<Product[]>(_cachedFeed);
  const [userId, setUserId] = useState<string | null>(_cachedUserId);
  const [loading, setLoading] = useState(_cachedFeed.length === 0);
  const [canGoBack, setCanGoBack] = useState(_cachedCanGoBack);
  const goBackRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (_cachedFeed.length > 0) return;
    async function load() {
      try {
        const id = await getUserId();
        setUserId(id);
        _cachedUserId = id;
        const data = id
          ? await fetchFeed(id, HOME_FEED_PAGE_SIZE)
          : await fetchFurnitureItems();
        const feed = data.length > 0 ? data : MOCK_PRODUCTS;
        setProducts(feed);
        _cachedFeed = feed;
      } catch (error) {
        console.error("Failed to fetch furniture:", error);
        setProducts(MOCK_PRODUCTS);
        _cachedFeed = MOCK_PRODUCTS;
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

  const handleGoBack = useCallback(() => {
    goBackRef.current();
    setCanGoBack(false);
    _cachedCanGoBack = false;
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

        <TouchableOpacity
          style={[styles.undoButton, !canGoBack && styles.undoButtonDisabled]}
          onPress={handleGoBack}
          disabled={!canGoBack}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-undo" size={ms(20)} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.deckContainer}>
        <View style={styles.deckFrame}>
          <SwipeCardDeck
            products={products}
            userId={userId}
            onLoadMore={handleLoadMore}
            goBackRef={goBackRef}
            onAfterSwipe={(direction) => {
              // Undo is only meaningful for LEFT swipes (re-show the dismissed
              // card). After a RIGHT swipe the item was saved/liked, so grey
              // the button out to make that obvious.
              const next = direction === "LEFT";
              setCanGoBack(next);
              _cachedCanGoBack = next;
            }}
          />
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
  undoButton: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: "#04B0FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#04B0FF",
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.35,
    shadowRadius: ms(6),
    elevation: 4,
  },
  undoButtonDisabled: {
    backgroundColor: "#C7C7CC",
    shadowOpacity: 0,
    elevation: 0,
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
