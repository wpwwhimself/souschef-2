import { StyleSheet, Text, View } from "react-native";

export default function TitledText({title, children}){
  return <View style={ss.wrapper}>
    <Text style={ss.title}>{title}</Text>
    <Text>{children}</Text>
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