import { FlatList, Text, View } from "react-native"
import Header from "../Header"
import s from "../../assets/style"
import TopHeader from "../TopHeader"
import { useState, useEffect } from "react"
import Loader from "../Loader"
import PositionTile from "../PositionTile"
import HorizontalLine from "../HorizontalLine"
import BarText from "../BarText"
import { getPassword } from "../../helpers/PasswordStorage"
import { rqGet, rqPatch } from "../../helpers/SCFetch"
import { API_SOUSCHEF_URL } from "../../assets/constants"
import { useIsFocused } from "@react-navigation/native"
import AmountIndicator from "../AmountIndicator"
import { SCButton, SCInput, SCModal } from "../SCSpecifics"
import { StockItem } from "../../types"
import { useToast } from "react-native-toast-notifications";
import { prepareDate } from "../../helpers/Prepare"

export default function Stock({navigation}){
  const isFocused = useIsFocused()
  const [stockFreezer, setStockFreezer] = useState([])
  const [stockCupboard, setStockCupboard] = useState([])
  const [loaderVisible, setLoaderVisible] = useState(true)
  const [stockEditor, setStockEditor] = useState(false)
  const toast = useToast();

  // stock item parameters
  const [sId, setSId] = useState(0)
  const [sAmount, setSAmount] = useState(0)
  const [sExpirationDate, setSExpirationDate] = useState("")
  const [pUnit, setPUnit] = useState("")

  const getData = async () => {
    setLoaderVisible(true);

    const magic_word = await getPassword();
    rqGet(API_SOUSCHEF_URL + "stock", {
      magic_word: magic_word,
    })
      .then(items => {
        const freezables = items.filter(stk => stk.product.ingredient.freezable)
        setStockFreezer(freezables)
        setStockCupboard(items.filter(stk => !freezables.includes(stk)))
      })
      .catch(err => console.error(err))
      .finally(() => setLoaderVisible(false))
  }
  const editStock = async (stock_id: number, unit: string) => {
    const magic_word = await getPassword();
    rqGet(API_SOUSCHEF_URL + "stock/" + stock_id, {
      magic_word: magic_word,
    })
      .then((item: StockItem) => {
        setSId(item.id)
        setSAmount(item.amount)
        setSExpirationDate(item.expiration_date)
        setPUnit(unit)
      })
      .catch(err => console.error(err))
      .finally(() => setStockEditor(true))
  }
  const handleSubmit = async () => {
    const toastId = toast.show("Zapisuję...");

    const magic_word = await getPassword();
    rqPatch(API_SOUSCHEF_URL + "stock/" + sId, {
      magic_word: magic_word,
      amount: sAmount || 0,
      expirationDate: sExpirationDate,
    })
    .then(res => {
      setStockEditor(false);
      toast.update(toastId, "Stan poprawiony", {type: "success"});
      getData();
    })
    .catch(err => {
      console.error(err)
      toast.update(toastId, `Nie udało się zapisać: ${err.message}`, {type: "danger"})
    })
  }

  useEffect(() => {
    if(isFocused) getData();
  }, [isFocused])

  interface ContentEl{
    header: string,
    icon: string,
    data: any[],
    emptyNotice: string,
  }
  const content: ContentEl[] = [
    {
      header: "Lodówka",
      icon: "cubes",
      data: stockFreezer,
      emptyNotice: "Lodówka pusta",
    },
    {
      header: "Szafka",
      icon: "cookie-bite",
      data: stockCupboard,
      emptyNotice: "Szafka pusta",
    },
  ]

  return <View style={s.wrapper}>
    <TopHeader title="Przeglądaj obecny stan swojej kuchni" />

    {loaderVisible
    ? <Loader />
    : <>
      {content.map(({header, icon, data, emptyNotice}, key) => <View key={key}>
        <Header icon={icon}>{header}</Header>
        <FlatList data={data}
          renderItem={({item}) =>
            <PositionTile
              icon={item.product.ingredient.category.symbol}
              title={item.product.name}
              subtitle={`${item.product.ingredient.name}`}
              buttons={<>
                <AmountIndicator amount={item.amount} unit={item.product.ingredient.unit} maxAmount={item.product.amount} expirationDate={item.expiration_date} />
                <SCButton icon="wrench" title="Popraw" color="lightgray" onPress={() => editStock(item.id, item.product.ingredient.unit)} />
              </>}
          />
          }
          ItemSeparatorComponent={() => <HorizontalLine />}
          ListEmptyComponent={<BarText color="lightgray">{emptyNotice}</BarText>}
        />
      </View>)}
    </>}

    <SCModal
      visible={stockEditor}
      title="Edytuj stan"
      onRequestClose={() => setStockEditor(false)}
      >
      <View style={[s.margin, s.center]}>
        <SCInput type="numeric" label={`Ilość (${pUnit})`} value={sAmount} onChange={setSAmount} />
        <SCInput type="date" label="Data przydatności" value={sExpirationDate} onChange={setSExpirationDate} />
      </View>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="check" title="Zatwierdź" onPress={handleSubmit} />
      </View>
    </SCModal>
  </View>
}
