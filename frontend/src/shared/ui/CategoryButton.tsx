import { View, Text, Image, StyleSheet, ImageSourcePropType, } from "react-native";


export function CategoryButton({text, isSelected}: {text: string, isSelected: boolean}) {
  return (
    <View style={[styles.outer, {backgroundColor: isSelected ?  "#D9EDF5" : "#EDECEC"}]}>
      <Text style={{color: "#333"}}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer:{
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 18,
    paddingTop: 11,
  }
}
);

export default CategoryButton;