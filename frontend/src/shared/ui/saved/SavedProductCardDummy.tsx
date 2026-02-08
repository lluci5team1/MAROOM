import { View, Text, Image, StyleSheet } from "react-native";

export function SavedProductCardDummy() {
  return (
    <View style={styles.shadowWrapper}></View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    width: 160,
    height: 250,
    borderColor: "transparent", // <- 추가함
    borderWidth: 1,
    borderRadius: 20, // <-- 추가함
    marginHorizontal: 16,
    marginVertical: 3,
  },
});
