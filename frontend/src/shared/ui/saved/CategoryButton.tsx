import { Pressable, Text, StyleSheet } from "react-native";
import { s, vs, ms } from "../../utils/scale";

type Props = {
  text: string;
  isSelected: boolean;
  onPress?: () => void;
};

export function CategoryButton({ text, isSelected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, isSelected && styles.chipActive]}
    >
      <Text style={[styles.text, isSelected && styles.textActive]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: vs(38),
    paddingHorizontal: s(18),
    borderRadius: 999,
    backgroundColor: "#EFEFEF",
    justifyContent: "center",
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: "#018ABD",
  },
  text: {
    fontSize: ms(13),
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#374151",
  },
  textActive: {
    color: "#fff",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
});

export default CategoryButton;
