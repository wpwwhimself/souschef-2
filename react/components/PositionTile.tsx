import { StyleSheet, Text, View } from "react-native";
import s from "../assets/style"
import Icon from "react-native-vector-icons/FontAwesome"
import { ReactNode } from "react";
import { BG2_COLOR, BG_COLOR, FG_COLOR, LIGHT_COLOR } from "../assets/constants";

interface I{
  title: string,
  subtitle?: string,
  icon?: string,
  numbers?: ReactNode,
  buttons?: ReactNode,
  color?: string,
  grayedOut?: boolean,
  tile?: boolean,
}

export default function PositionTile({title, subtitle, icon, numbers, buttons, color = BG_COLOR, grayedOut = false, tile = false}: I){
  const iiicon = (icon)
    ? /\p{Emoji}/u.test(icon)
      ? <Text style={{color: FG_COLOR}}>{icon}</Text>
      : <Icon name={icon} />
    : undefined;

  return <View style={[
    ss.wrapper, !tile ? s.flexRight : s.center, ss.icon,
    {
      justifyContent: "space-between",
      opacity: grayedOut ? 0.3 : 1,
      backgroundColor: color,
    },
    tile && {
      borderColor: LIGHT_COLOR,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 5,
      margin: 5,
      padding: 5,
    }
  ]}>
    {/* icon */}
    <View>
      {iiicon}
    </View>

    {/* text content */}
    <View style={[ss.text]}>
      <Text style={[s.text, s.bold, s.big, tile && {textAlign: "center"}]}>{title}</Text>
      {!!subtitle && <Text style={[s.text]}>{subtitle}</Text>}
    </View>

    {/* numbers */}
    <View style={[]}>
      {numbers}
    </View>

    {/* buttons */}
    <View style={[
      s.flexRight,
      ss.buttons,
      tile ? s.center : {justifyContent: "flex-end"}
    ]}>
      {buttons}
    </View>
  </View>
}

const ss = StyleSheet.create({
  wrapper: {

  },
  icon: {
    flex: 1
  },
  text: {
    flex: 1
  },
  buttons: {

  }
})
