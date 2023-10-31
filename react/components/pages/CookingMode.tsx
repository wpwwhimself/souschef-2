import { FlatList, Text, View } from "react-native";
import s from "../../assets/style"
import Header from "../Header";
import BarText from "../BarText";
import { SCButton, SCInput, SCModal, SCSelect } from "../SCSpecifics";
import PositionTile from "../PositionTile";
import { useEffect, useState } from "react";
import { rqDelete, rqGet, rqPatch, rqPost } from "../../helpers/SCFetch";
import { useToast } from "react-native-toast-notifications";
import { useIsFocused } from "@react-navigation/native";
import Loader from "../Loader";
import HorizontalLine from "../HorizontalLine";
import AmountIndicator from "../AmountIndicator";
import AddStockModal from "../AddStockModal";

export default function CookingMode(){
  const toast = useToast()
  const isFocused = useIsFocused()
  const [list, setList] = useState([])
  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [showModStockModal, setShowModStockModal] = useState(false)
  const [dangerModalMode, setDangerModalMode] = useState<false | "clear" | "clearOne" | "submit">(false)
  const [loaderVisible, setLoaderVisible] = useState(false)

  const [product, setProduct] = useState(undefined)
  const [sAmount, setSAmount] = useState(0)

  const getData = () => {
    setLoaderVisible(true)

    rqGet("cooking-products")
      .then(csi => setList(csi))
      .catch(err => toast.show("Nie udało się pobrać listy: "+err.message, {type: "danger"}))
      .finally(() => setLoaderVisible(false))
  }

  useEffect(() => {
    if(isFocused && !showAddStockModal) getData();
  }, [isFocused, showAddStockModal])

  const clearList = () => {
    const toastId = toast.show("Usuwam...")
    rqDelete(`cooking-products/${product ? product.id : ""}`)
      .then(res => {
        toast.update(toastId, "Produkt usunięty z listy", {type: "success"})
      }).catch(err => {
        toast.update(toastId, `Nie udało się usunąć produktu: ${err.message}`, {type: "danger"})
      }).finally(() => {
        setDangerModalMode(false)
        setProduct(undefined)
        getData()
      })
  }

  const prepareChangeStock = (cookingProduct) => {
    setProduct(cookingProduct)
    setSAmount(cookingProduct.amount)
    setShowModStockModal(true)
  }
  const changeStock = () => {
    const toastId = toast.show("Poprawiam...");
    rqPatch(`cooking-products/${product.id}`, {
      amount: sAmount,
    }).then(res => {
      toast.update(toastId, `Stan poprawiony na ${sAmount} ${product.product.ingredient.unit}`, {type: "success"})
    }).catch(err => {
      toast.update(toastId, `Nie udało się poprawić stanu: ${err.message}`, {type: "danger"})
    }).finally(() => {
      setShowModStockModal(false)
      setProduct(undefined)
      getData()
    })
  }

  const submitList = () => {
    const toastId = toast.show("Poprawiam stany...")
    rqPost("cooking-products/actions/clear")
      .then(res => {
        toast.update(toastId, `Stany odbite`, {type: "success"})
      }).catch(err => {
        toast.update(toastId, `Nie udało się odbić stanów: ${err.message}`, {type: "danger"})
      }).finally(() => {
        setDangerModalMode(false);
        getData()
      })
  }

  const dangerModes = {
    clear: {
      title: "Czyszczenie listy",
      text: "Czy na pewno chcesz wyczyścić listę?",
      confirm: clearList,
    },
    clearOne: {
      title: "Usunięcie produktu z listy",
      text: `Czy na pewno chcesz usunąć produkt ${product?.product.name} z listy?`,
      confirm: clearList,
    },
    submit: {
      title: "Zatwierdzenie list",
      text: "Zaraz odejmiesz stany. Czy wszystko jest poprawnie?",
      confirm: submitList,
    },
  }

  return <View style={[s.wrapper]}>
    <Header icon="balance-scale">Zmiana stanów</Header>

    <View style={{flex: 1}}>
    {loaderVisible
    ? <Loader />
    : <FlatList data={list}
      renderItem={({item}) => <PositionTile
        title={item.product.ingredient.name}
        subtitle={item.product.name}
        icon={item.product.ingredient.category.symbol}
        buttons={<>
          <AmountIndicator title="Do odjęcia"
            amount={item.amount}
            unit={item.product.ingredient.unit}
            maxAmount={item.stock_amount}
            expirationDate=""
          />
          <SCButton icon="wrench" color="lightgray" onPress={() => prepareChangeStock(item)} small />
        </>}
      />}
      ItemSeparatorComponent={() => <HorizontalLine />}
      ListEmptyComponent={<BarText color="lightgray" small>Dodaj pierwszą pozycję</BarText>}
    />}
    </View>

    <View style={[s.flexRight]}>
      <View style={{flexGrow: 1}}><SCButton icon="plus" title="Dodaj" onPress={() => setShowAddStockModal(true)} /></View>
      <View style={{flexGrow: 1}}><SCButton icon="times" title="Wyczyść" onPress={() => setDangerModalMode("clear")} color="red" /></View>
      <View style={{flexGrow: 1}}><SCButton icon="check" title="Zatwierdź" onPress={() => setDangerModalMode("submit")} color="green" /></View>
    </View>

    {/* cp add */}
    <AddStockModal visible={showAddStockModal} onRequestClose={() => setShowAddStockModal(false)} mode="cookingMode" />

    {/* cp mod */}
    <SCModal
      visible={showModStockModal}
      onRequestClose={() => setShowModStockModal(false)}
      title={`${product?.product.name}: stan`}
      >
      <View style={[s.margin]}>
        <View style={[s.flexRight, s.center]}>
          <AmountIndicator title="Stan obecny"
            amount={product?.stock_amount}
            unit={product?.product.ingredient.unit}
            minAmount={product?.product.ingredient.minimal_amount}
            maxAmount={product?.product.amount}
            expirationDate="" />
          <SCButton icon="thermometer-empty" color="lightgray" onPress={() => setSAmount(0)} />
          <SCButton icon="thermometer-full" color="lightgray" onPress={() => setSAmount(product.stock_amount)} />
        </View>
        <SCInput type="numeric" label={`Ilość do odjęcia (${product?.product.ingredient.unit})`} value={sAmount} onChange={setSAmount} />
      </View>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="check" title="Popraw" onPress={changeStock} />
        <SCButton icon="times" title="Wyczyść" onPress={() => {setShowModStockModal(false); setDangerModalMode("clearOne");}} color="red" />
      </View>
    </SCModal>

    {/* dangerbox */}
    <SCModal
      title={dangerModalMode && dangerModes[dangerModalMode].title}
      visible={dangerModalMode}
      onRequestClose={() => setDangerModalMode(false)}
      >
      <Text>{dangerModalMode && dangerModes[dangerModalMode ?? ""].text}</Text>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="fire-alt" title="Tak" color="red" onPress={dangerModalMode && dangerModes[dangerModalMode ?? ""].confirm} />
      </View>
    </SCModal>
  </View>
}
