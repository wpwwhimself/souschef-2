import { StyleSheet, Text, View } from "react-native";
import s from "../assets/style";

export default function TitledText({title, children}){
  return <View style={ss.wrapper}>
    <Text style={[s.text, ss.title]}>{title}</Text>
    <Text style={[s.text]}>{children}</Text>
  </View>
}

const ss = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  title: {
    color: "gray",
    fontSize: 12,
  },
})
