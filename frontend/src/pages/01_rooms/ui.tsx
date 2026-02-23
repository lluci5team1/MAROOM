import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import SlotAdd from "./SlotAdd";


export function RoomsPage() {


  return (
    <View style={{ flex: 1, alignItems: "center" }} >

        <>
          {/* 상단 */}
          <View style={{ width: "100%" }}>
            <View style={styles.topBar}>
              <Text style={{ fontSize: 18, letterSpacing: 0.1, fontFamily: "NotoSans_700Bold" }}> Rooms </Text>
            </View>
          </View>

          {/* 선 */}
          <View style={styles.line}></View>

          {/* 본문 */}
          <View style={{ flex: 1, width: "100%" }}>

            <FlatList
              data={[1,2,3,4,]}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => <SlotAdd /> }
              numColumns={2}
              columnWrapperStyle={styles.holderRow}
              contentContainerStyle={styles.holderContainer}
            />
          </View>
        </>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 75,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    marginHorizontal: 35,
  },
  line: {
    width: "90%",
    height: 0.5,
    borderBottomColor: "#D9D9D9",
    borderBottomWidth: 0.5,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryBar: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginVertical: 10,
    paddingTop: 5,
  },
  holderContainer: {
    paddingHorizontal: 20,   // 화면 좌우 여백
    paddingTop: 20,
  },
  holderRow: {
    justifyContent: "space-between", // 좌우 균등
  },
});