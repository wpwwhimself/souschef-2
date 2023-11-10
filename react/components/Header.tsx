import { View, Text, StyleSheet, TextStyle, StyleProp, ViewStyle } from "react-native";
import s from "../assets/style";
import { ACCENT_COLOR, FG_COLOR, LIGHT_COLOR } from "../assets/constants";
import Icon from "react-native-vector-icons/FontAwesome5"

export default function Header({children, icon = undefined, level = 2}){
  const color =
    level === 1 ? FG_COLOR :
    level === 2 ? ACCENT_COLOR :
                  LIGHT_COLOR;

  const lineStyle: StyleProp<ViewStyle> = {
    ...bts.line,
    backgroundColor: color,
  };

  const textStyle: StyleProp<TextStyle> = {
    ...bts.text,
    color: color,
    fontSize: 26 - level * 4, // 22, 18, 14
    fontWeight: (level >= 3 ? 'normal' : 'bold'),
  };

  const outerMarginSize = (level - 1) * 15;
  const innerMarginSize = 10;

  return <View style={bts.container}>
    <View style={[lineStyle, {marginLeft: outerMarginSize}]} />
    {icon && <Icon name={icon} size={15} color={color} style={{marginLeft: innerMarginSize}} />}
    <Text style={[textStyle, {marginHorizontal: innerMarginSize}]}>{children}</Text>
    <View style={[lineStyle, {marginRight: outerMarginSize}]} />
  </View>
}

// Header Style
const bts = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: 3,
  },
  text: {

  },
});
