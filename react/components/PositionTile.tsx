import { StyleSheet, Text, View } from "react-native";
import s from "../assets/style"
import Icon from "react-native-vector-icons/FontAwesome"
import { ReactNode } from "react";

interface I{
  title: string,
  subtitle?: string,
  icon?: string,
  buttons?: ReactNode,
}

export default function PositionTile({title, subtitle, icon, buttons}: I){
  const Icon = (icon)
    ? /\p{Emoji}/u.test(icon)
      ? <Text>{icon}</Text>
      : <Icon name={icon} />
    : undefined;

  return <View style={[ss.wrapper, s.flexRight, ss.icon, {justifyContent: "space-between"}]}>
    {/* icon */}
    <View>
      {Icon}
    </View>

    {/* text content */}
    <View style={[ss.text]}>
      <Text style={[s.bold, s.big]}>{title}</Text>
      {subtitle && <Text>{subtitle}</Text>}
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
    flex: 6
  },
  buttons: {
    flex: 3
  }
})