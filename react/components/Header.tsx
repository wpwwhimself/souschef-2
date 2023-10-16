import { View, Text, StyleSheet } from 'react-native'
import s from "../assets/style"
import Icon from "react-native-vector-icons/FontAwesome5"

export default function Header({icon, children}){
  return <View style={[s.flexRight, ss.s]}>
    {icon && <Icon name={icon} size={15} />}
    <Text style={[s.bigger, s.bold]}>{children}</Text>
  </View>
}

const ss = StyleSheet.create({
  s: {
    alignItems: "center",
  }
})