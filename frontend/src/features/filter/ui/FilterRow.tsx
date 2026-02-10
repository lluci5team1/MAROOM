import { Text, Pressable, StyleSheet } from "react-native";

export function FilterRow({ label }: { label: string }) {
  return (
    <Pressable style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.chevron}>›</Text>
    </Pressable>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
  },
  label: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Sansation_400Regular",
  },
  chevron: {
    fontSize: 22,
    color: "#999",
  },
});
