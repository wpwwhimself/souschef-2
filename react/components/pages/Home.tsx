import { SectionList, View } from "react-native";
import s from "../../assets/style"
import Header from "../Header";
import BarText from "../BarText";
import { ACCENT_COLOR } from "../../assets/constants";
import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import Loader from "../Loader";
import { rqGet } from "../../helpers/SCFetch";
import PositionTile from "../PositionTile";
import AmountIndicator from "../AmountIndicator";
import HorizontalLine from "../HorizontalLine";
import { useToast } from "react-native-toast-notifications";

export default function Home(){
  const isFocused = useIsFocused();
  const toast = useToast();
  const [loaderForShoppingList, setLoaderForShoppingList] = useState(false)
  const [loaderForSpoiled, setLoaderForSpoiled] = useState(false)
  const [shoppingList, setShoppingList] = useState([])
  const [spoiled, setSpoiled] = useState([])

  const getData = async () => {
    setLoaderForShoppingList(true);
    setLoaderForSpoiled(true);

    rqGet(["dbUrl", "magicWord", "magic_word"], "stock/status/lowStock")
      .then(items => {
        setShoppingList(items)
      })
      .catch(err => toast.show(err.message, {type: "danger"}))
      .finally(() => setLoaderForShoppingList(false))

    rqGet(["dbUrl", "magicWord", "magic_word"], "stock/status/spoiled")
      .then(items => {
        setSpoiled(items)
      })
      .catch(err => toast.show(err.message, {type: "danger"}))
      .finally(() => setLoaderForSpoiled(false))
  }

  const hello_texts = [
    "Witaj w swojej kuchni!",
    "Sous Chef do usług!",
    "Co gotujemy dzisiaj?",
    "Czas na papu?",
  ];

  interface ContentEl{
    header: string,
    icon: string,
    data: any[],
    emptyNotice: string,
  }
  const content: ContentEl[] = [
    {
      header: "Lista zakupów",
      icon: "shopping-cart",
      data: shoppingList,
      emptyNotice: "Niczego nam nie brakuje",
    },
    {
      header: "Do wyrzucenia",
      icon: "trash",
      data: spoiled,
      emptyNotice: "Wszystko jest (jeszcze) świeże",
    },
  ]

  useEffect(() => {
    if(isFocused) getData();
  }, [isFocused]);

  return (
    <View style={[s.wrapper]}>
      <BarText color={ACCENT_COLOR}>{hello_texts[Math.floor(Math.random() * hello_texts.length)]}</BarText>

      {loaderForShoppingList || loaderForSpoiled
      ? <Loader />
      : <SectionList sections={content}
        renderSectionHeader={({section}) => <Header icon={section.icon} color={ACCENT_COLOR}>{section.header}</Header>}
        renderItem={({item}) => <PositionTile
              icon={item.category_symbol}
              title={item.name}
              buttons={<>
                <AmountIndicator amount={item.stock_items_sum_amount}
                  unit={item.unit}
                  minAmount={item.minimal_amount}
                  expirationDate={item.stock_items_min_expiration_date}
                  />
              </>}
          />
          }
        ItemSeparatorComponent={() => <HorizontalLine />}
        renderSectionFooter={({section}) => section.data.length === 0 &&
          <BarText color="lightgray">{section.emptyNotice}</BarText>
        }
      />}
    </View>
  )
}
