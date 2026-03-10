import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabs } from "../../widgets/main-bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";

export function MainLayout() {
  const insets = useSafeAreaInsets();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={{ flex: 1, backgroundColor: "white", paddingTop: insets.top }}
      >
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
        <BottomTabs />
      </View>
    </GestureHandlerRootView>
  );
}
