import { FlatList, View } from "react-native"
import Header from "../Header"
import s from "../../assets/style"
import { useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import PositionTile from "../PositionTile";
import BarText from "../BarText";
import { rqGet } from "../../helpers/SCFetch";
import { SCButton } from "../SCSpecifics";

export default function Recipes({navigation}){
  const isFocused = useIsFocused();
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const getData = async () => {
      rqGet("recipes")
        .then(res => setRecipes(res))
        .catch(err => console.error(err))
      ;
    }
    if(isFocused) getData();
  }, [isFocused]);

  return <View style={s.wrapper}>
    <Header icon="lightbulb">Propozycje</Header>

    <Header icon="list">Lista</Header>
    <FlatList data={recipes}
      renderItem={({item}) => <PositionTile
          title="Cześć"
          subtitle="Jestem pudełkiem"
          icon="check"
          buttons={<>
            <SCButton title="Hi there" onPress={() => {}} />
            <SCButton title="Hi there" onPress={() => {}} />
          </>}
        />
      }
      ListEmptyComponent={<BarText color="lightgray">Brak przepisów</BarText>}
      />
  </View>
}
