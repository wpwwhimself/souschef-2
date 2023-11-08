import { View } from "react-native";
import BarText from "./BarText";
import { LIGHT_COLOR } from "../assets/constants";

interface Props{
  title: string,
  subtitle?: string,
}

export default function TopHeader({title, subtitle}: Props){
  return <View>
    <BarText>{title}</BarText>
    {subtitle && <BarText color={LIGHT_COLOR} small={true}>{subtitle}</BarText>}
  </View>
}
