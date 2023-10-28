import { FlatList, Text, View } from "react-native";
import s from "../../assets/style"
import Header from "../Header";
import BarText from "../BarText";
import { SCButton, SCInput, SCModal, SCSelect } from "../SCSpecifics";
import PositionTile from "../PositionTile";
import { useState } from "react";
import { rqGet } from "../../helpers/SCFetch";
import { prepareSelectItems } from "../../helpers/Prepare";
import { useToast } from "react-native-toast-notifications";
import { useIsFocused } from "@react-navigation/native";
import Loader from "../Loader";
import HorizontalLine from "../HorizontalLine";
import { Product, SelectItem } from "../../types";
import AmountIndicator from "../AmountIndicator";

export default function CookingMode(){
  const toast = useToast()
  const isFocused = useIsFocused()
  const [list, setList] = useState([])
  const [showModal, setShowModal] = useState<false | "prd" | "stk">(false)
  const [dangerModalMode, setDangerModalMode] = useState<false | "clear" | "clearOne" | "submit">(false)
  const [manualLookupMode, setManualLookupMode] = useState<false | "ean" | "list">(false)
  const [loaderVisible, setLoaderVisible] = useState(false)

  const [ingredients, setIngredients] = useState<SelectItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [product, setProduct] = useState(undefined)

  // product parameters
  const [pEan, setPEan] = useState("")
  const [pIngredientId, setPIngredientId] = useState(0)
  const [sAmount, setSAmount] = useState(0)

  const closeModal = () => {
    setManualLookupMode(false);
    setShowModal(false);
  }
  const clearList = () => {
    setList([]);
    setDangerModalMode(false);
  }
  const clearOne = () => {
    setList(list.filter(el => el !== product))
    setDangerModalMode(false);
  }
  const submitList = () => {
    setDangerModalMode(false);
  }
  const dangerModes = {
    clear: {
      title: "Czyszczenie listy",
      text: "Czy na pewno chcesz wyczyścić listę?",
      confirm: clearList,
    },
    clearOne: {
      title: "Usunięcie produktu z listy",
      text: `Czy na pewno chcesz usunąć produkt ${product?.name} z listy?`,
      confirm: clearOne,
    },
    submit: {
      title: "Zatwierdzenie list",
      text: "Zaraz odejmiesz stany. Czy wszystko jest poprawnie?",
      confirm: submitList,
    },
  }

  const openManualLookup = async (mode: "ean" | "list") => {
    mllIngChosen(pIngredientId);

    rqGet(["dbUrl", "magicWord", "magic_word"], "ingredients")
      .then(ings => { setIngredients(prepareSelectItems(ings, "name", "id")) })
      .catch(err => toast.show(`Problem z szukaniem składników: ${err.message}`, {type: "danger"}))
    ;

    setShowModal("prd");
    setManualLookupMode(mode);
  }

  const mleEanReady = async (ean: string) => {
    setPEan(ean);
    if(ean.length === 0) return;
    setLoaderVisible(true);

    rqGet(["dbUrl", "magicWord", "magic_word"], "products/ean/" + ean + "/1")
      .then(prds => { setProducts(prds) })
      .catch(err => console.error(err))
      .finally(() => setLoaderVisible(false))
    ;
  }

  const mllIngChosen = async (ing_id: number) => {
    setLoaderVisible(true);
    setPIngredientId(ing_id);

    // product list based on the chosen ingredient
    rqGet(["dbUrl", "magicWord", "magic_word"], "products/ingredient/" + ing_id + "/1")
      .then(prds => { setProducts(prds) })
      .catch(err => console.error(err))
      .finally(() => setLoaderVisible(false))
    ;
  }

  const mllPrdChosen = async (product_id: number, ean?: string) => {
    const product = products.find(prd => prd.id === product_id);
    setList([...list, {...product, amountToClear: 0}])
    closeModal()
  }

  const prepareChangeStock = (product) => {
    setProduct(product)
    setSAmount(product.amountToClear)
    setShowModal("stk")
  }
  const changeStock = () => {
    const newList = list.splice(
      list.findIndex(prd => prd === product),
      1,
      {...product, amountToClear: sAmount}
    )
    console.log(newList);
    setList(newList);
    toast.show(`Stan poprawiony na ${sAmount} ${product.ingredient.unit}`, {type: "success"})
    setShowModal(false)
  }

  return <View style={s.wrapper}>
    <Header icon="balance-scale">Zmiana stanów</Header>

    <FlatList data={list}
      renderItem={({item}) => <PositionTile
        title={item.ingredient.name}
        subtitle={item.name}
        icon={item.ingredient.category.symbol}
        buttons={<>
          <AmountIndicator
            amount={item.amountToClear}
            unit={item.ingredient.unit}
            expirationDate=""
          />
          <SCButton icon="eye" color="pink" onPress={() => console.log(list)} />
          <SCButton icon="wrench" color="lightgray" onPress={() => prepareChangeStock(item)} />
          <SCButton icon="times" color="red" onPress={() => {setProduct(item); setDangerModalMode("clearOne");}} />
        </>}
      />}
      ItemSeparatorComponent={() => <HorizontalLine />}
      ListEmptyComponent={<BarText color="lightgray">Dodaj pierwszą pozycję</BarText>}
    />

    {/* product info */}
    <SCModal
      visible={showModal == "prd"}
      title="Wybierz produkt"
      onRequestClose={closeModal}
      >

      {/* crossroads */
      manualLookupMode === false &&
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="barcode" title="Po EAN" onPress={() => openManualLookup("ean")} />
        <SCButton icon="box" title="Po składniku" onPress={() => openManualLookup("list")} />
      </View>
      }

      {/* lookup by EAN */
      manualLookupMode === "ean" &&
      <>
        <SCInput label="EAN" value={pEan} onChange={mleEanReady} />
        {!pEan
        ? <></>
        : loaderVisible
        ? <Loader />
        : <>
          <FlatList data={products}
            renderItem={({item}) =>
              <PositionTile
                icon={item.ingredient.category.symbol}
                title={item.name}
                subtitle={`${item.ean || "brak EAN"} • ${item.amount} ${item.ingredient.unit}`}
                buttons={<>
                  <SCButton color="lightgray" title="Wybierz" onPress={() => mllPrdChosen(item.id)} />
                </>}
              />
            }
            ItemSeparatorComponent={() => <HorizontalLine />}
            ListEmptyComponent={<BarText color="lightgray">Brak produktów dla tego EANu</BarText>}
          />
          <SCButton icon="plus" title="Nowy" onPress={() => mllPrdChosen(0, pEan)} />
        </>}
      </>
      }

      {/* lookup by list */
      manualLookupMode === "list" &&
      <>
        <SCSelect items={ingredients} label="Składnik" value={pIngredientId} onChange={mllIngChosen} />
        {!pIngredientId
        ? <></>
        : loaderVisible
        ? <Loader />
        : <>
          <FlatList data={products}
            renderItem={({item}) =>
              <PositionTile
                icon={item.ingredient.category.symbol}
                title={item.name}
                subtitle={`${item.ean || "brak EAN"} • ${item.amount} ${item.ingredient.unit}`}
                buttons={<>
                  <SCButton color="lightgray" title="Wybierz" onPress={() => mllPrdChosen(item.id)} />
                </>}
              />
            }
            ItemSeparatorComponent={() => <HorizontalLine />}
            ListEmptyComponent={<BarText color="lightgray">Brak produktów dla tego składnika</BarText>}
          />
          <SCButton icon="plus" title="Nowy" onPress={() => mllPrdChosen(0)} />
        </>}
      </>
      }
    </SCModal>

    <SCModal
      visible={showModal === "stk"}
      title={product?.name}
      onRequestClose={() => setShowModal(false)}
    >
      <View style={s.margin}>
        <SCInput label="Ilość do odjęcia" type="numeric" value={sAmount} onChange={setSAmount} />
        <View style={[s.flexRight, s.center]}>
          <SCButton icon="check" title="Zmień" onPress={changeStock} />
        </View>
      </View>
    </SCModal>

    <View style={[s.flexRight]}>
      <View style={{flexGrow: 1}}><SCButton icon="plus" title="Dodaj" onPress={() => setShowModal("prd")} /></View>
      <View style={{flexGrow: 1}}><SCButton icon="times" title="Wyczyść" onPress={() => setDangerModalMode("clear")} /></View>
      <View style={{flexGrow: 1}}><SCButton icon="check" title="Zatwierdź" onPress={() => setDangerModalMode("submit")} color="green" /></View>
    </View>

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
