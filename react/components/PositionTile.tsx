import { StyleSheet, Text, View } from "react-native";
import s from "../assets/style"
import Icon from "react-native-vector-icons/FontAwesome"
import { ReactNode } from "react";
import { FG_COLOR } from "../assets/constants";

interface I{
  title: string,
  subtitle?: string,
  icon?: string,
  buttons?: ReactNode,
  grayedOut?: boolean,
}

export default function PositionTile({title, subtitle, icon, buttons, grayedOut = false}: I){
  const iiicon = (icon)
    ? /\p{Emoji}/u.test(icon)
      ? <Text style={{color: FG_COLOR}}>{icon}</Text>
      : <Icon name={icon} />
    : undefined;

  return <View style={[ss.wrapper, s.flexRight, ss.icon, {justifyContent: "space-between", opacity: grayedOut ? 0.3 : 1}]}>
    {/* icon */}
    <View>
      {iiicon}
    </View>

    {/* text content */}
    <View style={[ss.text]}>
      <Text style={[s.text, s.bold, s.big]}>{title}</Text>
      {!!subtitle && <Text style={[s.text]}>{subtitle}</Text>}
    </View>

    {/* buttons */}
    <View style={[s.flexRight, ss.buttons, {justifyContent: "flex-end"}]}>
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
