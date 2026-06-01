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
// We cache the full "current view" — products plus the inputs that produced
// them — so a round-trip through the detail page lands the user back on the
// exact same filtered/searched grid instead of resetting to defaults.
let _cachedProducts: Product[] = [];
let _cachedQuery = "";
let _cachedFilter: FilterState = { ...DEFAULT_FILTER };
let _cachedIsDefault = true;
let _cachedOffset = 0;
let _cachedHasMore = true;
// Scroll position survives tab switches and round-trips to the detail page,
// so returning from a product detail lands the user back where they left off.
let _savedScrollY = 0;

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

const PAGE_SIZE = 60;

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
  const [query, setQuery] = useState(_cachedQuery);
  const [activeFilter, setActiveFilter] = useState<FilterState>(_cachedFilter);
  const [products, setProducts] = useState<Product[]>(_cachedProducts);
  const [loading, setLoading] = useState(_cachedProducts.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  // Visible count must mirror the cached products length on remount, otherwise
  // a return-from-detail re-renders only the first PAGE_SIZE items and the
  // scroll-restore can't reach Y positions that lived in paginated items.
  const [visibleCount, setVisibleCount] = useState(
    _cachedProducts.length > 0 ? _cachedProducts.length : PAGE_SIZE,
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const offsetRef = useRef<number>(_cachedOffset || _cachedProducts.length);
  const isDefaultRef = useRef(_cachedIsDefault);
  // Tracks the params that produced the currently-displayed list so paginated
  // load-more requests can reuse them (and so a stale page from a previous
  // search/filter never gets appended to a newer one).
  const lastSearchRef = useRef<{ q: string; filter: FilterState }>({
    q: _cachedQuery,
    filter: _cachedFilter,
  });
  const hasMoreRef = useRef(_cachedHasMore);
  // Monotonic id used to invalidate in-flight requests when the user kicks
  // off a newer search/filter/refresh while previous results are still loading.
  const requestIdRef = useRef(0);
  const scrollRef = useRef<ScrollView>(null);
  // We only start persisting scrollY once we've had a chance to restore it,
  // otherwise the initial Y=0 from mount would clobber the saved value.
  const scrollRestoredRef = useRef(false);

  const buildSearchParams = (searchText: string, filter: FilterState) => ({
    q: searchText,
    brand: filter.brand,
    category: filter.category,
    style: filter.style,
    color: expandColorNames(filter.color),
    minPrice: filter.priceRange.min > PRICE_MIN ? filter.priceRange.min : undefined,
    maxPrice: filter.priceRange.max < PRICE_MAX ? filter.priceRange.max : undefined,
    sortBy: filter.sortBy,
  });

  const loadProducts = useCallback(async (searchText: string, filter: FilterState) => {
    // `sortBy === "recommended"` is the backend's default (score-based), so we
    // treat it the same as no sortBy. Any other value (price asc/desc, etc.)
    // is a real sort that must go through /search instead of /recommendations.
    const sortByActive = !!filter.sortBy && filter.sortBy !== "recommended";
    const isDefault = !searchText && !filter.brand && filter.category.length === 0
      && filter.color.length === 0 && filter.style.length === 0
      && filter.priceRange.min <= PRICE_MIN && filter.priceRange.max >= PRICE_MAX
      && !sortByActive;

    isDefaultRef.current = isDefault;
    lastSearchRef.current = { q: searchText, filter };
    hasMoreRef.current = true;
    // Any in-flight load-more from a previous query becomes stale.
    const requestId = ++requestIdRef.current;
    // Cancel any pending pagination lock so the new search isn't blocked.
    loadingMoreRef.current = false;
    setLoadingMore(false);
    if (!isDefault) setSearching(true);

    try {
      let data: Product[];

      if (isDefault && userIdRef.current) {
        data = await fetchRecommendations(userIdRef.current, PAGE_SIZE, 0);
      } else {
        data = await searchFurnitureItems(
          buildSearchParams(searchText, filter),
          PAGE_SIZE,
          0,
        );
      }

      if (requestId !== requestIdRef.current) return;

      // Only fall back to mock when no filter is active and backend returned nothing
      const result = (!isDefault || data.length > 0)
        ? data
        : applyClientSideFilters(EXPLORE_MOCK, searchText, filter);

      offsetRef.current = result.length;
      hasMoreRef.current = data.length >= PAGE_SIZE;
      // Content changed (search/filter/initial load) — start from the top
      // and forget any previously saved scroll position.
      _savedScrollY = 0;
      scrollRestoredRef.current = true;
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      setProducts(result);
      setVisibleCount(result.length);
      // Cache the full view so a round-trip to the detail page restores the
      // same filtered/searched grid instead of resetting to defaults.
      _cachedProducts = result;
      _cachedQuery = searchText;
      _cachedFilter = filter;
      _cachedIsDefault = isDefault;
      _cachedOffset = offsetRef.current;
      _cachedHasMore = hasMoreRef.current;
    } catch {
      if (requestId !== requestIdRef.current) return;
      // On error only fall back to mock when no filter is active
      if (isDefault) {
        const fallback = applyClientSideFilters(EXPLORE_MOCK, searchText, filter);
        offsetRef.current = fallback.length;
        hasMoreRef.current = false;
        setProducts(fallback);
        setVisibleCount(fallback.length);
        _cachedProducts = fallback;
        _cachedQuery = searchText;
        _cachedFilter = filter;
        _cachedIsDefault = true;
        _cachedOffset = fallback.length;
        _cachedHasMore = false;
      } else {
        // Search/filter failed — clear results so the empty-state UI shows.
        offsetRef.current = 0;
        hasMoreRef.current = false;
        setProducts([]);
        setVisibleCount(0);
        _cachedProducts = [];
        _cachedQuery = searchText;
        _cachedFilter = filter;
        _cachedIsDefault = false;
        _cachedOffset = 0;
        _cachedHasMore = false;
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
        setSearching(false);
      }
    }
  }, []);

  useEffect(() => {
    getUserId()
      .then((id) => { userIdRef.current = id; })
      .catch(() => {})
      .finally(() => {
        if (_cachedProducts.length === 0) loadProducts("", DEFAULT_FILTER);
      });
  }, []);

  const handleRefresh = useCallback(() => {
    _cachedProducts = [];
    _cachedQuery = "";
    _cachedFilter = { ...DEFAULT_FILTER };
    _cachedIsDefault = true;
    _cachedOffset = 0;
    _cachedHasMore = true;
    _savedScrollY = 0;
    offsetRef.current = 0;
    hasMoreRef.current = true;
    setQuery("");
    setActiveFilter(DEFAULT_FILTER);
    setVisibleCount(PAGE_SIZE);
    setRefreshing(true);
    loadProducts("", DEFAULT_FILTER);
  }, [loadProducts]);

  const handleScroll = useCallback((e: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    // Persist the scroll position only after the initial restore pass —
    // otherwise the mount-time Y=0 event would overwrite a real saved value.
    if (scrollRestoredRef.current) {
      _savedScrollY = contentOffset.y;
    }
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    const nearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 400;
    if (!nearBottom) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    // Snapshot what produced the current list so a result that arrives after
    // a new search has fired never gets appended to the wrong query.
    const requestId = requestIdRef.current;
    const wasDefault = isDefaultRef.current;
    const startOffset = offsetRef.current;
    const fetchPromise: Promise<Product[]> = wasDefault && userIdRef.current
      ? fetchRecommendations(userIdRef.current, PAGE_SIZE, startOffset)
      : searchFurnitureItems(
          buildSearchParams(lastSearchRef.current.q, lastSearchRef.current.filter),
          PAGE_SIZE,
          startOffset,
        );

    fetchPromise
      .then((more: Product[]) => {
        if (requestId !== requestIdRef.current) return;
        if (more.length < PAGE_SIZE) hasMoreRef.current = false;
        _cachedHasMore = hasMoreRef.current;
        if (more.length === 0) return;

        // Defensive client-side dedupe — the server already paginates with
        // offset, but this guards against deterministic ties / cache quirks.
        setProducts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          const unique = more.filter((p) => !seen.has(p.id));
          if (unique.length === 0) return prev;
          offsetRef.current = startOffset + more.length;
          const updated = [...prev, ...unique];
          // Always cache so detail-page round-trips restore the same scroll
          // position and the same set of loaded pages.
          _cachedProducts = updated;
          _cachedOffset = offsetRef.current;
          setVisibleCount(updated.length);
          return updated;
        });
      })
      .catch(() => {})
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setLoadingMore(false);
          loadingMoreRef.current = false;
        }
      });
  }, []);

  const visibleProducts = products.slice(0, visibleCount);

  const blocks = useMemo(() => {
    const out: Product[][] = [];
    for (let i = 0; i < visibleProducts.length; i += 3) {
      out.push(visibleProducts.slice(i, i + 3));
    }
    return out;
    // Depend on the products array reference (not just .length) so a fresh
    // search/filter result of identical length still triggers a rebuild —
    // otherwise the previously-cached blocks keep references to the old items
    // and the grid renders nothing for the newly fetched products.
  }, [products, visibleCount]);

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
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={() => loadProducts(query, activeFilter)}
        />
      </View>
      <View style={styles.divider} />

      {/* Grid */}
      {searching ? (
        <LoadingScreen />
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color="#018ABD" />
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptySubtitle}>We can't find any item matching{"\n"}your search</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onContentSizeChange={(_w, h) => {
            if (scrollRestoredRef.current) return;
            // Nothing to restore — flip the flag so onScroll starts persisting.
            if (_savedScrollY <= 0) {
              scrollRestoredRef.current = true;
              return;
            }
            // Wait until the layout is tall enough for the saved offset,
            // otherwise scrollTo silently clamps to the current max. If the
            // content isn't tall enough yet (images still loading, async
            // pagination not in cache), bail without flipping the flag so the
            // next onContentSizeChange tick gets another shot.
            if (h >= _savedScrollY) {
              scrollRef.current?.scrollTo({ y: _savedScrollY, animated: false });
              scrollRestoredRef.current = true;
            }
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {blocks.map((block, i) => {
            // Deterministic shape per row position so item layout is stable
            // across re-entries, refreshes, and infinite-scroll appends.
            const type = i % 3;
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
