import { useCallback, useEffect, useMemo, useState } from "react";
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
import { MOCK_PRODUCTS } from "../../entities/product/mockData";
import { fetchSavedProducts } from "../../entities/product/api";
import { getUserId } from "../../shared/api/token";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";
import CategoryButton from "../../shared/ui/saved/CategoryButton";
import { SavedProductCard, CARD_W } from "../../shared/ui/saved/SavedProductCard";

const MOCK_SAVED: Product[] = [
  ...MOCK_PRODUCTS,
  ...MOCK_PRODUCTS.map((p) => ({ ...p, id: p.id + "-s2" })),
  ...MOCK_PRODUCTS.map((p) => ({ ...p, id: p.id + "-s3" })),
];

const CATEGORIES = ["All Items", "Living Room", "Bedroom", "Dining Room", "Office", "Outdoor"];

export let _cachedSaved: Product[] = [];

export function invalidateSavedCache() {
  _cachedSaved = [];
}

export function SavedPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(_cachedSaved);
  const [loading, setLoading] = useState(_cachedSaved.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [curCategory, setCurCategory] = useState("All Items");

  const load = useCallback(async () => {
    try {
      const userId = await getUserId();
      if (userId) {
        const data = await fetchSavedProducts(userId);
        const result = data.length > 0 ? data : MOCK_SAVED;
        setProducts(result);
        _cachedSaved = result;
      } else {
        setProducts(MOCK_SAVED);
        _cachedSaved = MOCK_SAVED;
      }
    } catch {
      setProducts(MOCK_SAVED);
      _cachedSaved = MOCK_SAVED;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (_cachedSaved.length === 0) load();
  }, []);

  const handleRefresh = useCallback(() => {
    _cachedSaved = [];
    setRefreshing(true);
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (curCategory === "All Items") return products;
    return products.filter((p) => p.roomType === curCategory);
  }, [curCategory, products]);

  // ensure even columns
  const displayItems = filtered.length % 2 !== 0 ? [...filtered, null] : filtered;

  if (loading && products.length === 0) return <LoadingScreen />;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <Text style={styles.header}>Saved</Text>
      <View style={styles.divider} />

      {/* Category chips */}
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
            onPress={() => setCurCategory(cat)}
          />
        ))}
      </ScrollView>

      {/* Grid */}
      <FlatList
          data={displayItems}
          keyExtractor={(item, i) => item?.id ?? `empty-${i}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          renderItem={({ item }) =>
            item ? (
              <SavedProductCard
                product={item}
                onPress={() =>
                  router.push({ pathname: "/(main)/[id]", params: { id: item.id, data: JSON.stringify(item), initialSaved: "true" } })
                }
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
    fontSize: 20,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
    textAlign: "center",
    paddingTop: 12,
    paddingBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  chips: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 52,
  },
  grid: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    gap: 24,
  },
  row: {
    gap: 14,
  },
});
