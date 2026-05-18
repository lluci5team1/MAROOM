import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

export function SavedPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [curCategory, setCurCategory] = useState("All Items");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const userId = await getUserId();
        if (userId) {
          const data = await fetchSavedProducts(userId);
          setProducts(data.length > 0 ? data : MOCK_SAVED);
        } else {
          setProducts(MOCK_SAVED);
        }
      } catch (e) {
        setProducts(MOCK_SAVED);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (curCategory === "All Items") return products;
    return products.filter((p) => p.roomType === curCategory);
  }, [curCategory, products]);

  // ensure even columns
  const displayItems = filtered.length % 2 !== 0 ? [...filtered, null] : filtered;

  if (loading) return <LoadingScreen />;

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
          renderItem={({ item }) =>
            item ? (
              <SavedProductCard
                product={item}
                onPress={() =>
                  router.push({ pathname: "/(main)/[id]", params: { id: item.id } })
                }
              />
            ) : (
              <View style={{ width: CARD_W }} />
            )
          }
        />

      {/* Floating filter button */}
      <Pressable style={styles.filterButton}>
        <Ionicons name="options-outline" size={22} color="#fff" />
      </Pressable>
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
  filterButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#018ABD",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#018ABD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
