import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
//import { Dimensions } from "react-native";

type RoundButtonProps = {
  icon: ImageSourcePropType;
  onPress?: () => void;
};

export function RoundButton({ icon, onPress }: RoundButtonProps) {
  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.button}>
        <Image source={icon} style={styles.image} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    width: 80,
    height: 80,
    borderRadius: 50,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  button: {
    flex: 1,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "40%",
    height: "40%",
  },
});
