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

import { icons } from "../../shared/assets/icons";
import { FilterModal } from "../../features/filter/ui/FilterModal";
import { fetchFurnitureItems } from "../../entities/product/api";
import { Product } from "../../entities/product/type";

export function ExplorePage() {
  const GAP = 2;
  const NUM_COLUMNS = 3;
  const SCREEN_WIDTH = Dimensions.get("window").width;
  const ITEM_SIZE = (SCREEN_WIDTH - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  const [filterOpen, setFilterOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // fetch products from backend
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchFurnitureItems();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
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
        />
      </View>

      {/* Grid */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{ gap: GAP }}
        renderItem={({ item }) => (
          <Pressable>
            <Image
              source={{ uri: item.productUrl }}
              style={{
                width: ITEM_SIZE,
                height: ITEM_SIZE,
              }}
            />
          </Pressable>
        )}
      />

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
        onApply={() => {
          setFilterOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

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
});
