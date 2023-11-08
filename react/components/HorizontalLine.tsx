import { StyleSheet, View } from "react-native";
import { LIGHT_COLOR } from "../assets/constants";

const HorizontalLine = ({color = LIGHT_COLOR}) =>
  <View style={{ ...ss.line, backgroundColor: color }} />

const ss = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
    margin: 5,
  }
})

export default HorizontalLine;
