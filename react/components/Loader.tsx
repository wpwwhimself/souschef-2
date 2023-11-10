import { ActivityIndicator, Text, View } from "react-native";
import s from "../assets/style"
import BarText from "./Header";
import { ACCENT_COLOR, LIGHT_COLOR } from "../assets/constants";

export default function Loader({mode = "loading"}){
  return <View style={s.center}>
    <ActivityIndicator size="large" color={ACCENT_COLOR} />
    <Text style={{ ...s.bold, ...s.big, color: LIGHT_COLOR }}>Wczytuję</Text>
  </View>
}

