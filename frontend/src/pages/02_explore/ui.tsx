import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Pressable,
  TextInput,
  View,
  StyleSheet,
  Image,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { icons } from "../../shared/assets/icons";
import { FilterModal } from "../../features/filter/ui/FilterModal";
import { DEFAULT_FILTER, FilterState } from "../../features/filter/model/type";
import { searchFurnitureItems } from "../../entities/product/api";
import { MOCK_PRODUCTS } from "../../entities/product/mockData";
import { Product } from "../../entities/product/type";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";

// ─── Layout constants ─────────────────────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PAD = 16;
const GAP = 10;
const USABLE = SCREEN_WIDTH - H_PAD * 2;

// Block A / C  (big + 2 small) — all squares
const SMALL_W = Math.floor((USABLE - GAP * 2) / 3);
const BIG_W = USABLE - GAP - SMALL_W;
const SMALL_H = SMALL_W;
const BIG_H = BIG_W;

// Block B  (3 equal)
const COL3_W = Math.floor((USABLE - GAP * 2) / 3);
const ROW3_H = 130;

// ─── Module-level cache (survives tab switches) ───────────────────────────────
let _cachedProducts: Product[] = [];

// ─── Mock data ────────────────────────────────────────────────────────────────
const EXPLORE_MOCK: Product[] = [
  ...MOCK_PRODUCTS,
  ...MOCK_PRODUCTS.map((p) => ({ ...p, id: p.id + "-b" })),
  ...MOCK_PRODUCTS.map((p) => ({ ...p, id: p.id + "-c" })),
];

function applyClientSideFilters(items: Product[], q: string, filter: FilterState) {
  const query = q.trim().toLowerCase();
  let result = items.filter((item) => {
    if (query && !item.title.toLowerCase().includes(query)) return false;
    if (filter.brand && item.brand.toLowerCase() !== filter.brand.toLowerCase()) return false;
    if (item.price < filter.priceRange.min || item.price > filter.priceRange.max) return false;
    if (filter.style.length > 0) {
      const itemStyle = item.style.toLowerCase();
      const match = filter.style.some((s) => itemStyle.includes(s.toLowerCase()) || s.toLowerCase().includes(itemStyle));
      if (!match) return false;
    }
    return true;
  });
  if (filter.sortBy === "price-high-to-low") result = [...result].sort((a, b) => b.price - a.price);
  if (filter.sortBy === "price-low-to-high") result = [...result].sort((a, b) => a.price - b.price);
  return result;
}

// ─── Block renderers ──────────────────────────────────────────────────────────
function GridImage({ item, width, height, router }: { item: Product; width: number; height: number; router: any }) {
  return (
    <Pressable onPress={() => router.push({ pathname: "/(main)/[id]", params: { id: item.id, data: JSON.stringify(item) } })}>
      {!!item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width, height, borderRadius: 14, backgroundColor: "#F1F5F9" }}
          resizeMode="cover"
        />
      )}
    </Pressable>
  );
}

function BlockFeaturedLeft({ items, router }: { items: Product[]; router: any }) {
  return (
    <View style={[styles.block, { flexDirection: "row", gap: GAP }]}>
      <GridImage item={items[0]} width={BIG_W} height={BIG_H} router={router} />
      <View style={{ gap: GAP }}>
        {items[1] && <GridImage item={items[1]} width={SMALL_W} height={SMALL_H} router={router} />}
        {items[2] && <GridImage item={items[2]} width={SMALL_W} height={SMALL_H} router={router} />}
      </View>
    </View>
  );
}

function BlockRow3({ items, router }: { items: Product[]; router: any }) {
  return (
    <View style={[styles.block, { flexDirection: "row", gap: GAP }]}>
      {items.map((item) => (
        <GridImage key={item.id} item={item} width={COL3_W} height={ROW3_H} router={router} />
      ))}
    </View>
  );
}

function BlockFeaturedRight({ items, router }: { items: Product[]; router: any }) {
  return (
    <View style={[styles.block, { flexDirection: "row", gap: GAP }]}>
      <View style={{ gap: GAP }}>
        {items[0] && <GridImage item={items[0]} width={SMALL_W} height={SMALL_H} router={router} />}
        {items[1] && <GridImage item={items[1]} width={SMALL_W} height={SMALL_H} router={router} />}
      </View>
      {items[2] && <GridImage item={items[2]} width={BIG_W} height={BIG_H} router={router} />}
    </View>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function ExplorePage() {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [products, setProducts] = useState<Product[]>(_cachedProducts);
  const [loading, setLoading] = useState(_cachedProducts.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = useCallback(async (searchText: string, filter: FilterState) => {
    try {
      const data = await searchFurnitureItems({
        q: searchText,
        brand: filter.brand,
        category: filter.category,
        roomType: filter.category,
        color: filter.color,
        minPrice: filter.priceRange.min,
        maxPrice: filter.priceRange.max,
        sortBy: filter.sortBy,
      });
      const result = data.length > 0 ? data : applyClientSideFilters(EXPLORE_MOCK, searchText, filter);
      setProducts(result);
      if (!searchText && !filter.brand && filter.color.length === 0 && filter.style.length === 0) {
        _cachedProducts = result;
      }
    } catch {
      const fallback = applyClientSideFilters(EXPLORE_MOCK, searchText, filter);
      setProducts(fallback);
      if (!searchText) _cachedProducts = fallback;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (_cachedProducts.length === 0) loadProducts("", DEFAULT_FILTER);
  }, []);

  const handleRefresh = useCallback(() => {
    _cachedProducts = [];
    setRefreshing(true);
    loadProducts("", DEFAULT_FILTER);
  }, [loadProducts]);

  const { blocks, blockTypes } = useMemo(() => {
    const blocks: Product[][] = [];
    for (let i = 0; i < products.length; i += 3) {
      blocks.push(products.slice(i, i + 3));
    }
    const blockTypes = blocks.map(() => Math.floor(Math.random() * 3));
    return { blocks, blockTypes };
  }, [products]);

  if (loading && products.length === 0) return <LoadingScreen />;

  return (
    <View style={styles.screen}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search for furniture..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          value={query}
          onChangeText={(text) => { setQuery(text); loadProducts(text, activeFilter); }}
        />
      </View>
      <View style={styles.divider} />

      {/* Grid */}
      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color="#018ABD" />
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptySubtitle}>We can't find any item matching{"\n"}your search</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {blocks.map((block, i) => {
            const type = blockTypes[i];
            if (type === 0) return <BlockFeaturedLeft key={i} items={block} router={router} />;
            if (type === 1) return <BlockRow3 key={i} items={block} router={router} />;
            return <BlockFeaturedRight key={i} items={block} router={router} />;
          })}
        </ScrollView>
      )}

      {/* Floating filter */}
      <Pressable style={styles.filterButton} onPress={() => setFilterOpen(true)}>
        <Image source={icons.filter} style={styles.filterIcon} />
      </Pressable>

      <FilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(filter) => {
          setFilterOpen(false);
          setActiveFilter(filter);
          loadProducts(query, filter);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "#F1F5F9",
    marginHorizontal: H_PAD,
    marginTop: 8,
    marginBottom: 14,
    borderRadius: 999,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#1E293B",
  },
  divider: {
    height: 3,
    backgroundColor: "#E2E8F0",
    marginBottom: 14,
  },
  grid: {
    paddingHorizontal: H_PAD,
    paddingBottom: 100,
    gap: GAP,
  },
  block: {
    // gap + marginBottom handled per block via grid gap
  },
  filterButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#018ABD",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 10,
    shadowColor: "#018ABD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  filterIcon: { width: 26, height: 26, tintColor: "white" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "PlusJakartaSans_600SemiBold", color: "#111" },
  emptySubtitle: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular", color: "#888", textAlign: "center", lineHeight: 20 },
});
