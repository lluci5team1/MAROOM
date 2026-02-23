import { View, Text, Image, StyleSheet, ImageSourcePropType, Pressable, } from "react-native";


export function CategoryButton({text, isSelected, onPress}: {text: string, isSelected: boolean, onPress?: () => void}) {
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.outer, {backgroundColor: isSelected ?  "#D9EDF5" : "#EDECEC"}]}>
        <Text style={{color: "#333", fontFamily: "Sansation_400Regular"}}>{text}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer:{
    borderRadius: 22,
    height: 44,
    paddingHorizontal: 18,
    paddingTop: 11,
  }
}
);

export default CategoryButton;