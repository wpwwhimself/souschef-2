import { View, Text, StyleSheet } from 'react-native'
import s from "../assets/style"
import Icon from "react-native-vector-icons/FontAwesome5"

export default function Header({icon, children, color = "black"}){
  return <View style={[s.flexRight, ss.s]}>
    {icon && <Icon name={icon} size={15} color={color} />}
    <Text style={[s.bigger, s.bold, {color: color}]}>{children}</Text>
  </View>
}

const ss = StyleSheet.create({
  s: {
    alignItems: "center",
  }
})
