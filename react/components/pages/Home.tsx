import { View } from "react-native";
import s from "../../assets/style"
import Header from "../Header";
import BarText from "../BarText";
import { ACCENT_COLOR } from "../../assets/constants";
import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";

export default function Home(){
  const isFocused = useIsFocused();

  const hello_texts = [
    "Witaj w swojej kuchni!",
    "Sous Chef do usług!",
    "Co gotujemy dzisiaj?",
    "Czas na papu?",
  ];

  useEffect(() => {
    //if(isFocused) getData();
  }, [isFocused]);

  return (
    <View style={[s.wrapper]}>
      <BarText color={ACCENT_COLOR}>{hello_texts[Math.floor(Math.random() * hello_texts.length)]}</BarText>

      <Header icon="check">Lista zakupów</Header>
      <Header icon="trash">Do wyrzucenia</Header>
    </View>
  )
}