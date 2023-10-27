import { View, Text } from "react-native"
import Header from "../Header"
import s from "../../assets/style"

export default function Profile(){

  return <View style={s.wrapper}>
    <Header icon="chart-line">Statystyki kucharzowania</Header>
  </View>
}
