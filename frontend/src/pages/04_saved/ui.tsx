import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { Product } from "../../entities/product/type";
import { fetchSavedProducts, unsaveProductForUser } from "../../entities/product/api";
import { getUserId } from "../../shared/api/token";
import { s, vs, ms } from "../../shared/utils/scale";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";
import CategoryButton from "../../shared/ui/saved/CategoryButton";
import { SavedProductCard, CARD_W } from "../../shared/ui/saved/SavedProductCard";

const CATEGORIES = ["All Items", "Living Room", "Bedroom", "Dining Room", "Office", "Outdoor"];

export let _cachedSaved: Product[] = [];
// Scroll position survives tab switches and round-trips to the detail page,
// so returning from a saved-item detail lands the user back where they left off.
let _savedScrollY = 0;

export function invalidateSavedCache() {
  _cachedSaved = [];
  _savedScrollY = 0;
}

export function SavedPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(_cachedSaved);
  const [loading, setLoading] = useState(_cachedSaved.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [curCategory, setCurCategory] = useState("All Items");
  const [userId, setUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<Product | null>>(null);
  // Don't persist scrollY until after we've had a chance to restore it,
  // otherwise the mount-time Y=0 event would clobber the saved value.
  const scrollRestoredRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const id = await getUserId();
      setUserId(id);
      if (id) {
        const data = await fetchSavedProducts(id);
        setProducts(data);
        _cachedSaved = data;
      } else {
        setProducts([]);
        _cachedSaved = [];
      }
    } catch {
      setProducts([]);
      _cachedSaved = [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleUnsave = useCallback(async (product: Product) => {
    if (!userId) return;
    // Optimistically remove from UI
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== product.id);
      _cachedSaved = updated;
      return updated;
    });
    try {
      await unsaveProductForUser(userId, product.id);
    } catch {
      // Revert on failure
      setProducts((prev) => {
        const reverted = [...prev, product];
        _cachedSaved = reverted;
        return reverted;
      });
    }
  }, [userId]);

  useEffect(() => {
    if (_cachedSaved.length === 0) load();
  }, []);

  const handleRefresh = useCallback(() => {
    _cachedSaved = [];
    _savedScrollY = 0;
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    setRefreshing(true);
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (curCategory === "All Items") return products;
    return products.filter((p) => p.roomType === curCategory);
  }, [curCategory, products]);

  const displayItems = filtered.length % 2 !== 0 ? [...filtered, null] : filtered;

  if (loading && products.length === 0) return <LoadingScreen />;

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Saved</Text>
      <View style={styles.divider} />

      <FlatList
        ref={flatListRef}
        data={displayItems}
        keyExtractor={(item, i) => item?.id ?? `empty-${i}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          if (scrollRestoredRef.current) {
            _savedScrollY = e.nativeEvent.contentOffset.y;
          }
        }}
        onContentSizeChange={(_w, h) => {
          if (scrollRestoredRef.current) return;
          // Nothing to restore — flip the flag so onScroll starts persisting.
          if (_savedScrollY <= 0) {
            scrollRestoredRef.current = true;
            return;
          }
          // Wait until the layout is tall enough for the saved offset,
          // otherwise scrollToOffset silently clamps to the current max. Bail
          // without flipping the flag so the next content-size tick gets
          // another shot (images still loading, list still hydrating, etc.).
          if (h >= _savedScrollY) {
            flatListRef.current?.scrollToOffset({ offset: _savedScrollY, animated: false });
            scrollRestoredRef.current = true;
          }
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {CATEGORIES.map((cat) => (
              <CategoryButton
                key={cat}
                text={cat}
                isSelected={curCategory === cat}
                onPress={() => {
                  // Different category = different list; start from the top.
                  _savedScrollY = 0;
                  flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
                  setCurCategory(cat);
                }}
              />
            ))}
          </ScrollView>
        }
        renderItem={({ item }) =>
          item ? (
            <SavedProductCard
              product={item}
              onPress={() =>
                router.push({ pathname: "/(main)/[id]", params: { id: item.id, data: JSON.stringify(item), initialSaved: "true" } })
              }
              onUnsave={() => handleUnsave(item)}
            />
          ) : (
            <View style={{ width: CARD_W }} />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: ms(20),
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
    textAlign: "center",
    paddingTop: vs(12),
    paddingBottom: vs(14),
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  chips: {
    flexDirection: "row",
    gap: s(10),
    paddingHorizontal: s(16),
    paddingTop: vs(14),
    paddingBottom: vs(14),
  },
  grid: {
    paddingHorizontal: s(24),
    paddingBottom: vs(100),
    gap: vs(24),
  },
  row: {
    gap: s(14),
  },
});
