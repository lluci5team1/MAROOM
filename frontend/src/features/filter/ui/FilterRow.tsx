import { Text, Pressable, View, StyleSheet } from "react-native";

type Props = {
  label: string;
  selected?: string;
  onPress: () => void;
};

export function FilterRow({ label, selected, onPress }: Props) {
  return (
    <Pressable style={rowStyles.row} onPress={onPress}>
      <View style={rowStyles.labelContainer}>
        <Text style={rowStyles.label}>{label}</Text>
        {selected && (
          <>
            <Text style={rowStyles.dot}> •</Text>
            <Text style={rowStyles.selected}> {selected}</Text>
          </>
        )}
      </View>
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
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Sansation_400Regular",
  },
  dot: {
    fontSize: 16,
    color: "#018ABD",
    fontFamily: "Sansation_400Regular",
  },
  selected: {
    fontSize: 13,
    color: "#018ABD",
    fontFamily: "Sansation_400Regular",
  },
  chevron: {
    fontSize: 22,
    color: "#999",
  },
});
