import { View, Text, StyleSheet } from "react-native";

export default function BarText({children, color = "black", small = false}){
  const lineStyle = {
    ...bts.line,
    backgroundColor: color,
  };

  const textStyle = {
    ...bts.text,
    color: color,
    fontSize: small ? 12 : 18,
  };

  return <View style={bts.container}>
    <View style={lineStyle} />
    <Text style={textStyle}>{children}</Text>
    <View style={lineStyle} />
  </View>
}

// BarText Style
const bts = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: 2,
  },
  text: {
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
});