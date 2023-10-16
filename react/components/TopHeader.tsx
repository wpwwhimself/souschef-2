import { View } from "react-native";
import BarText from "./BarText";

interface Props{
  title: string,
  subtitle?: string,
}

export default function TopHeader({title, subtitle}: Props){
  return <View>
    <BarText>{title}</BarText>
    {subtitle && <BarText color="lightgray" small={true}>{subtitle}</BarText>}
  </View>
}