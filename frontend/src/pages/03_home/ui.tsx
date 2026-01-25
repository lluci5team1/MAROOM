import React from "react";
import { View, Text, Image, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SwipeCardDeck } from "../../widgets/swipe-card-stack";
import { RoundButton } from "../../shared/ui/likeButton";
import { BottomTabs } from "../../widgets/main-bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { products } from "../../entities/product/product";

export function HomePage() {
  return (
    <>
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: "#3A86C8" }}>
          MAROOM
        </Text>
      </View>

      {/* Centered content */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1, width: "100%", maxHeight: 600 }}>
          <SwipeCardDeck products={products} />
        </View>
      </View>
    </>
  );
}
