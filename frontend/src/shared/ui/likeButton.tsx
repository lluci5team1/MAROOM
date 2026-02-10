import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  Pressable,
} from "react-native";
import { icons } from "../assets/icons";

type RoundButtonProps = {
  icon: ImageSourcePropType;
  variant: "like" | "dislike";
  onPress?: () => void;
  onLongPress?: () => void;
};

const COLORS = {
  like: "#f43f5e", // ❤️ red
  dislike: "#2a2a2a", // ❌ blue
};

export function RoundButton({
  icon,
  variant,
  onPress,
  onLongPress,
}: RoundButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.shadowWrapper}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.button,
            pressed && { backgroundColor: COLORS[variant] },
          ]}
        >
          <Image
            source={pressed && variant === "dislike" ? icons.X_White : icon}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      )}
    </Pressable>
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
