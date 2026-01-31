import React from "react";
import { FlatList, Pressable, TextInput, Text, View } from "react-native";
import { products } from "../../entities/product/product";
import { Dimensions } from "react-native";
import { Image } from "react-native";
import { icons } from "../../shared/assets/icons";

export function ExplorePage() {
  const GAP = 2;
  const NUM_COLUMNS = 3;
  const SCREEN_WIDTH = Dimensions.get("window").width;

  const ITEM_SIZE = (SCREEN_WIDTH - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          height: 40,
          backgroundColor: "#F0F0F0",
          marginBottom: 10,
          marginHorizontal: 16,
          borderRadius: 25,
          paddingHorizontal: 12,
        }}
      >
        <Image
          source={icons.search}
          style={{
            width: 20,
            height: 20,
            tintColor: "#999",
            marginRight: 8,
          }}
        />

        <TextInput
          placeholder="Search your furniture"
          placeholderTextColor="#999"
          style={{
            flex: 1,
            fontSize: 14,
          }}
        />
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{ gap: GAP }}
        renderItem={({ item }) => (
          <Pressable>
            <Image
              source={{ uri: item.image }}
              style={{
                width: ITEM_SIZE,
                height: ITEM_SIZE,
              }}
            />
          </Pressable>
        )}
      />
    </View>
  );
}
