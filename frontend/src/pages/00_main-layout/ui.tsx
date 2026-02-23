import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabs } from "../../widgets/main-bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";

export function MainLayout() {
  const isAndroid = Platform.OS === "android";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {isAndroid ? (
          // ===========안드로이드===========
          <SafeAreaView style={{ flex: 1 }}>
            <Slot />
            <BottomTabs />
          </SafeAreaView>
        ) : (
          // ===========IOS===========
          <>
            <SafeAreaView style={{ flex: 1 }}>
              <Slot />
            </SafeAreaView>
            <BottomTabs />
          </>
        )}
      </View>
    </GestureHandlerRootView>
  );
}
