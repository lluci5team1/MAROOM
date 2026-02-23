import { View, Text, Image, StyleSheet, ImageSourcePropType, } from "react-native";


export function SlotAdd() {
  return (
    <View style={[styles.outer]}>
      <Text style={{color: "#333", fontFamily: "Sansation_400Regular", fontSize: 36}}>+</Text>
      <Text style={{color: "#333", fontFamily: "Sansation_400Regular"}}>Add</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: "#F5F5F5",
    flex: 1,        
    aspectRatio: 1,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 22,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    margin: 15,
  },
}
);

export default SlotAdd;