import { View } from "react-native"
import s from "../../assets/style"
import TitledText from "../TitledText"
import pkg from "../../package.json"
import Splash from "../../assets/sc_splash.svg"

export default function About({navigation}){
  return <View style={[s.wrapper]}>
    <Splash />
    <TitledText title="Wersja aplikacji">{pkg.version}</TitledText>
    <TitledText title="Projekt i wykonanie">Wojciech Przybyła</TitledText>
  </View>
}
