import { StyleSheet, View } from "react-native";

const HorizontalLine = ({color = "lightgray"}) =>
  <View style={{ ...ss.line, backgroundColor: color }} />

const ss = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
    margin: 5,
  }
})

export default HorizontalLine;