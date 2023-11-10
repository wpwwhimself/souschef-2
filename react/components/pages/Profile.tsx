import { View, Text } from "react-native"
import Header from "../Header"
import s from "../../assets/style"
import { FG_COLOR } from "../../assets/constants"

export default function Profile(){

  return <View style={s.wrapper}>
    <Header icon="user" level={1}>Moje dane</Header>

    <Header icon="chart-line">Statystyki kucharzowania</Header>
    <Text style={{color: FG_COLOR}}>🚧 Tu wkrótce coś będzie...</Text>
  </View>
}
