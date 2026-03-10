import { useState, useEffect } from "react";
import {
  FlatList,
  Pressable,
  TextInput,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { icons } from "../../shared/assets/icons";
import { FilterModal } from "../../features/filter/ui/FilterModal";
import { DEFAULT_FILTER, FilterState } from "../../features/filter/model/type";
import { searchFurnitureItems } from "../../entities/product/api";
import { Product } from "../../entities/product/type";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";

function applyClientSideFilters(
  items: Product[],
  searchText: string,
  filter: FilterState,
): Product[] {
  const q = searchText.trim().toLowerCase();
  const selectedRooms = filter.category.map((v) => v.toLowerCase());
  const selectedColors = filter.color.map((v) => v.toLowerCase());

  let result = items.filter((item) => {
    if (q && !item.title.toLowerCase().includes(q)) return false;
    if (filter.brand && item.brand.toLowerCase() !== filter.brand.toLowerCase()) return false;
    if (item.price < filter.priceRange.min || item.price > filter.priceRange.max) return false;

    if (selectedRooms.length > 0) {
      const room = (item.roomType ?? "").toLowerCase();
      const category = (item.category ?? "").toLowerCase();
      const matchedRoom = selectedRooms.some(
        (value) => room.includes(value) || category.includes(value),
      );
      if (!matchedRoom) return false;
    }

    if (selectedColors.length > 0) {
      const itemColor = (item.color ?? "").toLowerCase();
      const matchedColor = selectedColors.some((value) => {
        const tokens = value.split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
        return tokens.some((token) => itemColor.includes(token));
      });
      if (!matchedColor) return false;
    }

    return true;
  });

  if (filter.sortBy === "price-high-to-low") {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (filter.sortBy === "price-low-to-high") {
    result = [...result].sort((a, b) => a.price - b.price);
  }

  return result;
}

export function ExplorePage() {
  const router = useRouter();
  const GAP = 2;
  const NUM_COLUMNS = 3;
  const SCREEN_WIDTH = Dimensions.get("window").width;
  const ITEM_SIZE = (SCREEN_WIDTH - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchWithBackend(searchText: string, filter: FilterState) {
    setLoading(true);
    try {
      const backendItems = await searchFurnitureItems({
        q: searchText,
        brand: filter.brand,
        category: filter.category,
        roomType: filter.category,
        color: filter.color,
        minPrice: filter.priceRange.min,
        maxPrice: filter.priceRange.max,
        sortBy: filter.sortBy,
      });
      setProducts(applyClientSideFilters(backendItems, searchText, filter));
    } catch (error) {
      console.error("Failed to search products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWithBackend("", DEFAULT_FILTER);
  }, []);

  function handleSearch(text: string) {
    setQuery(text);
    fetchWithBackend(text, activeFilter);
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Image source={icons.search} style={styles.searchIcon} />
        <TextInput
          placeholder="Search your furniture"
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearch}
        />
      </View>

      {/* Grid or Empty State */}
      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={80} color="#018ABD" />
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptySubtitle}>
            We can't find any item matching{"\n"}your search
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={{ gap: GAP }}
          contentContainerStyle={{ gap: GAP }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(main)/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Image
                source={{ uri: item.imageUrl || item.productUrl }}
                style={{
                  width: ITEM_SIZE,
                  height: ITEM_SIZE,
                }}
              />
            </Pressable>
          )}
        />
      )}

      {/* Floating filter button */}
      <Pressable
        style={styles.filterButton}
        onPress={() => setFilterOpen(true)}
      >
        <Image source={icons.filter} style={styles.filterIcon} />
      </Pressable>

      {/* Filter modal */}
      <FilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(filter) => {
          console.log("[ExploreFilter] apply pressed with filter:", filter);
          console.log("[ExploreFilter] current query:", query);
          setFilterOpen(false);
          setActiveFilter(filter);
          fetchWithBackend(query, filter);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    backgroundColor: "#F0F0F0",
    marginBottom: 10,
    marginHorizontal: 16,
    borderRadius: 25,
    paddingHorizontal: 12,
  },

  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "#999",
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
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
  },

  filterIcon: {
    width: 28,
    height: 28,
    tintColor: "white",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
  },
});
