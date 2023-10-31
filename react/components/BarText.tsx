import { View, Text, StyleSheet, TextStyle, StyleProp, ViewStyle } from "react-native";

export default function BarText({children, color = "black", small = false}){
  const lineStyle: StyleProp<ViewStyle> = {
    ...bts.line,
    backgroundColor: color,
  };

  const textStyle: StyleProp<TextStyle> = {
    ...bts.text,
    color: color,
    fontSize: small ? 14 : 18,
    fontWeight: (small ? 'normal' : 'bold'),
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
  },
});
