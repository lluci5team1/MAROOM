import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { s, vs, ms } from "../../shared/utils/scale";
import { _cachedSaved } from "../04_saved/ui";
import { FilterModal } from "../../features/filter/ui/FilterModal";
import { DEFAULT_FILTER, FilterState, PRICE_MAX, PRICE_MIN } from "../../features/filter/model/type";
import { fetchRecommendations, searchFurnitureItems } from "../../entities/product/api";
import { getUserId } from "../../shared/api/token";
import { MOCK_PRODUCTS } from "../../entities/product/mockData";
import { Product } from "../../entities/product/type";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";

// ─── Layout constants ─────────────────────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PAD = s(16);
const GAP = s(10);
const USABLE = SCREEN_WIDTH - H_PAD * 2;

// Block A / C  (big + 2 small) — all squares
const SMALL_W = Math.floor((USABLE - GAP * 2) / 3);
const BIG_W = USABLE - GAP - SMALL_W;
const SMALL_H = SMALL_W;
const BIG_H = BIG_W;

// Block B  (3 equal)
const COL3_W = Math.floor((USABLE - GAP * 2) / 3);
const ROW3_H = COL3_W;

// ─── Module-level cache (survives tab switches) ───────────────────────────────
let _cachedProducts: Product[] = [];

// ─── Color name → DB keyword expansion ───────────────────────────────────────
const COLOR_KEYWORDS: Record<string, string[]> = {
  "Warm Neutral": ["beige", "cream", "sand", "tan", "ivory", "linen"],
  "Cool Neutral": ["slate", "gray", "grey", "ash", "silver", "mist", "stone"],
  "Vibrant":      ["blue", "cyan", "red", "yellow", "orange", "purple", "teal"],
  "Earthy":       ["sage", "olive", "terracotta", "brown", "green", "khaki", "rust"],
  "B & W":        ["black", "white", "charcoal", "onyx", "ebony"],
  "Pastel":       ["pink", "lavender", "mint", "blush", "peach", "lilac"],
};

function expandColorNames(names: string[]): string[] {
  const out: string[] = [];
  for (const n of names) {
    const mapped = COLOR_KEYWORDS[n];
    if (mapped) out.push(...mapped);
    else out.push(n.toLowerCase());
  }
  return [...new Set(out)];
}

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

const PAGE_SIZE = 100;

// ─── Three-dot loading indicator ─────────────────────────────────────────────
function ThreeDotsLoader() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p + 1) % 3), 380);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: vs(24), gap: s(8) }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ width: s(10), height: s(10), borderRadius: s(5), backgroundColor: active === i ? "#1A1A1A" : "#D1D5DB" }} />
      ))}
    </View>
  );
}

// ─── Block renderers ──────────────────────────────────────────────────────────
function GridImage({ item, width, height, router }: { item: Product; width: number; height: number; router: any }) {
  return (
    <Pressable onPress={() => router.push({ pathname: "/(main)/[id]", params: { id: item.id, data: JSON.stringify(item) } })}>
      {!!item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width, height, borderRadius: ms(14), backgroundColor: "#F1F5F9" }}
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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  const loadProducts = useCallback(async (searchText: string, filter: FilterState) => {
    const isDefault = !searchText && !filter.brand && filter.category.length === 0
      && filter.color.length === 0 && filter.style.length === 0
      && filter.priceRange.min <= PRICE_MIN && filter.priceRange.max >= PRICE_MAX;

    try {
      let data: Product[];

      if (isDefault && userIdRef.current) {
        data = await fetchRecommendations(userIdRef.current, 60);
      } else {
        data = await searchFurnitureItems({
          q: searchText,
          brand: filter.brand,
          category: filter.category,
          color: expandColorNames(filter.color),
          minPrice: filter.priceRange.min > PRICE_MIN ? filter.priceRange.min : undefined,
          maxPrice: filter.priceRange.max < PRICE_MAX ? filter.priceRange.max : undefined,
          sortBy: filter.sortBy,
        });
      }

      // Only fall back to mock when no filter is active and backend returned nothing
      const base = (!isDefault || data.length > 0)
        ? data
        : applyClientSideFilters(EXPLORE_MOCK, searchText, filter);

      // Style has no backend support — filter client-side on the results
      const result = filter.style.length === 0 ? base : base.filter((item) => {
        const s = (item.style ?? "").toLowerCase();
        return filter.style.some((f) => s.includes(f.toLowerCase()) || f.toLowerCase().includes(s));
      });

      setProducts(result);
      if (isDefault) _cachedProducts = result;
    } catch {
      // On error only fall back to mock when no filter is active
      if (isDefault) {
        const fallback = applyClientSideFilters(EXPLORE_MOCK, searchText, filter);
        setProducts(fallback);
        _cachedProducts = fallback;
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (_cachedProducts.length > 0) return;
    getUserId()
      .then((id) => { userIdRef.current = id; })
      .catch(() => {})
      .finally(() => loadProducts("", DEFAULT_FILTER));
  }, []);

  const handleRefresh = useCallback(() => {
    _cachedProducts = [];
    setVisibleCount(PAGE_SIZE);
    setRefreshing(true);
    loadProducts("", DEFAULT_FILTER);
  }, [loadProducts]);

  // Reset visible window whenever the product list changes (search / filter)
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [products]);

  const handleScroll = useCallback((e: any) => {
    if (loadingMoreRef.current) return;
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const nearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 400;
    if (!nearBottom) return;
    setVisibleCount((prev) => {
      if (prev >= products.length) return prev;
      loadingMoreRef.current = true;
      setLoadingMore(true);
      setTimeout(() => {
        setVisibleCount((c) => Math.min(c + PAGE_SIZE, products.length));
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }, 500);
      return prev;
    });
  }, [products.length]);

  const visibleProducts = products.slice(0, visibleCount);

  const { blocks, blockTypes } = useMemo(() => {
    const blocks: Product[][] = [];
    for (let i = 0; i < visibleProducts.length; i += 3) {
      blocks.push(visibleProducts.slice(i, i + 3));
    }
    const blockTypes = blocks.map(() => Math.floor(Math.random() * 3));
    return { blocks, blockTypes };
  }, [visibleProducts]);

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
          scrollEventThrottle={200}
          onScroll={handleScroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {blocks.map((block, i) => {
            const type = blockTypes[i];
            if (type === 0) return <BlockFeaturedLeft key={i} items={block} router={router} />;
            if (type === 1) return <BlockRow3 key={i} items={block} router={router} />;
            return <BlockFeaturedRight key={i} items={block} router={router} />;
          })}
          {loadingMore && <ThreeDotsLoader />}
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
    height: vs(48),
    backgroundColor: "#F1F5F9",
    marginHorizontal: H_PAD,
    marginTop: vs(8),
    marginBottom: vs(14),
    borderRadius: 999,
    paddingHorizontal: s(16),
  },
  searchInput: {
    flex: 1,
    fontSize: ms(14),
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#1E293B",
  },
  divider: {
    height: vs(3),
    backgroundColor: "#E2E8F0",
    marginBottom: vs(14),
  },
  grid: {
    paddingHorizontal: H_PAD,
    paddingBottom: vs(100),
    gap: GAP,
  },
  block: {},
  filterButton: {
    position: "absolute",
    right: s(20),
    bottom: vs(20),
    width: s(56),
    height: s(56),
    borderRadius: s(28),
    backgroundColor: "#018ABD",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 10,
    shadowColor: "#018ABD",
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.35,
    shadowRadius: ms(8),
  },
  filterIcon: { width: s(26), height: s(26), tintColor: "white" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: vs(12) },
  emptyTitle: { fontSize: ms(18), fontFamily: "PlusJakartaSans_600SemiBold", color: "#111" },
  emptySubtitle: { fontSize: ms(13), fontFamily: "PlusJakartaSans_400Regular", color: "#888", textAlign: "center", lineHeight: ms(20) },
});
