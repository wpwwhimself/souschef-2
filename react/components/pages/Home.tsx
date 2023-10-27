import { SectionList, View } from "react-native";
import s from "../../assets/style"
import Header from "../Header";
import BarText from "../BarText";
import { ACCENT_COLOR, API_SOUSCHEF_URL } from "../../assets/constants";
import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import Loader from "../Loader";
import { getPassword } from "../../helpers/Storage";
import { rqGet } from "../../helpers/SCFetch";
import PositionTile from "../PositionTile";
import AmountIndicator from "../AmountIndicator";
import { SCButton } from "../SCSpecifics";
import HorizontalLine from "../HorizontalLine";

export default function Home(){
  const isFocused = useIsFocused();
  const [loaderForShoppingList, setLoaderForShoppingList] = useState(false)
  const [loaderForSpoiled, setLoaderForSpoiled] = useState(false)
  const [shoppingList, setShoppingList] = useState([])
  const [spoiled, setSpoiled] = useState([])

  const getData = async () => {
    setLoaderForShoppingList(true);
    setLoaderForSpoiled(true);
    const magic_word = await getPassword();

    rqGet(API_SOUSCHEF_URL + "stock/status/lowStock", {
      magic_word: magic_word,
    })
      .then(items => {
        setShoppingList(items)
      })
      .catch(err => console.error(err))
      .finally(() => setLoaderForShoppingList(false))

    rqGet(API_SOUSCHEF_URL + "stock/status/spoiled", {
      magic_word: magic_word,
    })
      .then(items => {
        setSpoiled(items)
      })
      .catch(err => console.error(err))
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