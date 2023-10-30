import { FlatList, View } from "react-native"
import Header from "../Header"
import s from "../../assets/style"
import { useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import PositionTile from "../PositionTile";
import BarText from "../BarText";
import { rqGet } from "../../helpers/SCFetch";
import { SCButton } from "../SCSpecifics";
import Loader from "../Loader";
import { useToast } from "react-native-toast-notifications";

export default function Recipes({navigation}){
  const isFocused = useIsFocused();
  const [recipes, setRecipes] = useState([]);
  const [loaderVisible, setLoaderVisible] = useState(false)
  const toast = useToast();

  const getData = () => {
    setLoaderVisible(true)
    rqGet("recipes")
      .then(res => setRecipes(res))
      .catch(err => toast.show(err.message, {type: "danger"}))
      .finally(() => setLoaderVisible(false))
    ;
  }

  useEffect(() => {
    if(isFocused) getData();
  }, [isFocused]);

  return <View style={s.wrapper}>
    <Header icon="lightbulb">Propozycje</Header>

    <Header icon="list">Lista</Header>
    <SCButton icon="plus" title="Dodaj nowy" onPress={() => {}} />
    <View style={{ flex: 1 }}>
      {loaderVisible
      ? <Loader />
      : <FlatList data={recipes}
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
      }
    </View>
  </View>
}
