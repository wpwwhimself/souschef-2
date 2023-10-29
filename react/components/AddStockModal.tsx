import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { View, Text, Button, StyleSheet, FlatList } from "react-native"
import Header from "./Header"
import s from "../assets/style"
import { BarCodeScanner } from "expo-barcode-scanner"
import BarText from './BarText'
import { rqGet, rqPost } from '../helpers/SCFetch'
import { Product, SelectItem } from '../types'
import { SCButton, SCModal, SCInput, SCSelect } from './SCSpecifics'
import { prepareSelectItems } from '../helpers/Prepare'
import Loader from './Loader'
import PositionTile from './PositionTile'
import HorizontalLine from './HorizontalLine'
import { useToast } from "react-native-toast-notifications";
import { useIsFocused } from '@react-navigation/native'
import moment from 'moment'

// interface UPCProduct{
//   title: string,
//   barcode: string,
//   metadata: {
//     quantity: string,
//   },
// }

interface BSInput{
  visible: boolean,
  onRequestClose: () => any,
  ean?: string,
  ingId?: number,
}

export default function AddStockModal({visible, onRequestClose, ean, ingId}: BSInput){
  const [hasPermissions, setHasPermissions] = useState(null)
  const [scannerOn, setScannerOn] = useState(false)
  const [showModal, setShowModal] = useState<false | "prd" | "stk">(false)
  const [manualLookupMode, setManualLookupMode] = useState<false | "ean" | "list">(false)
  const [loaderVisible, setLoaderVisible] = useState(false)
  const toast = useToast();
  const isFocused = useIsFocused();

  const [ingredients, setIngredients] = useState<SelectItem[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // product parameters
  const [pId, setPId] = useState(0)
  const [pName, setPName] = useState("")
  const [pEan, setPEan] = useState("")
  const [pIngredientId, setPIngredientId] = useState(0)
  const [pIngredientUnit, setPIngredientUnit] = useState("")
  const [pAmount, setPAmount] = useState<number>(undefined)
  const [pEstExpirationDays, setPEstExpirationDays] = useState<number>(undefined)

  // stock item parameters
  const [sAmount, setSAmount] = useState<number>(undefined)
  const [sExpirationDate, setSExpirationDate] = useState<string>(undefined)

  useEffect(() => {
    if(visible){
      setShowModal("prd")
      setManualLookupMode(false)
      setPEan(ean)
      setPIngredientId(ingId)
    }else{
      setShowModal(false)
    }
  }, [visible])

  const handleBarCodeScanned = async ({type, data}) => {
    setScannerOn(false);

    mleEanReady(data);
  }

  useEffect(() => {
    setScannerOn(isFocused)
  }, [isFocused])

  const openManualLookup = async (mode: "ean" | "list") => {
    mllIngChosen(pIngredientId);

    rqGet(["dbUrl", "magicWord", "magic_word"], "ingredients")
      .then(ings => { setIngredients(prepareSelectItems(ings, "name", "id")) })
      .catch(err => toast.show(`Problem z szukaniem składników: ${err.message}`, {type: "danger"}))
    ;

    setShowModal("prd");
    setManualLookupMode(mode);
    if(mode === "ean"){
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermissions(status === "granted");
      })();
      setScannerOn(true)
    }else{
      setScannerOn(false)
    }
  }

  const mleEanReady = async (ean: string) => {
    setPEan(ean);
    if(ean.length === 0) return;
    setLoaderVisible(true);

    rqGet(["dbUrl", "magicWord", "magic_word"], "products/ean/" + ean)
      .then(prds => { setProducts(prds) })
      .catch(err => console.error(err))
      .finally(() => setLoaderVisible(false))
    ;
  }

  const mllIngChosen = async (ing_id: number) => {
    setLoaderVisible(true);
    setPIngredientId(ing_id);

    // get ingredient unit
    rqGet(["dbUrl", "magicWord", "magic_word"], "ingredients/" + ing_id)
      .then(ing => { setPIngredientUnit(ing.unit) })
      .catch(err => console.error(err))

    // product list based on the chosen ingredient
    rqGet(["dbUrl", "magicWord", "magic_word"], "products/ingredient/" + ing_id)
      .then(prds => { setProducts(prds) })
      .catch(err => console.error(err))
      .finally(() => setLoaderVisible(false))
    ;
  }

  const mllPrdChosen = async (product_id: number, ean?: string) => {
    const product = products.find(prd => prd.id === product_id);

    setPId(product?.id)
    setPName(product?.name)
    setPEan(ean || product?.ean)
    setPAmount(product?.amount)
    setPEstExpirationDays(product?.est_expiration_days)
    setPIngredientUnit(product?.ingredient.unit)

    setSAmount(undefined)
    setSExpirationDate(
      product?.est_expiration_days != 0
      ? moment().add(product?.est_expiration_days, 'd').format("YYYY-MM-DD")
      : undefined
    );

    mllIngChosen(pIngredientId);
    setShowModal("stk");
  }

  const handleSubmit = async () => {
    const toastId = toast.show("Zapisuję...");

    // create product if needed
    (async () => (!pId)
    ? rqPost(["dbUrl", "magicWord", "magic_word"], "products", {
        ean: pEan,
        name: pName,
        ingredientId: pIngredientId,
        amount: pAmount,
        estExpirationDays: pEstExpirationDays,
      })
    : rqGet(["dbUrl", "magicWord", "magic_word"], "products/" + pId)
    )().then(res => {
      if(!res.id) throw new Error("Błąd w tworzeniu produktu")
      return res
    })
    .then(product => // create stock item
      rqPost(["dbUrl", "magicWord", "magic_word"], "stock", {
        productId: product.id,
        amount: sAmount,
        expirationDate: sExpirationDate,
      })
    ).then(res => {
      toast.update(toastId, "Pozycja dodana", {type: "success"});
    }).catch(err => {
      console.error(err)
      toast.update(toastId, `Nie udało się zapisać: ${err.message}`, {type: "danger"})
    }).finally(() => {
      setShowModal(false)
      onRequestClose()
    })
  }

  return <SCModal
    visible={visible}
    title={
      showModal === "prd" ? "Wybierz produkt"
      : showModal === "stk" ? "Dane o produkcie"
      : ""
    }
    onRequestClose={onRequestClose}
    >
    {/* <SCButton icon="wrench" title="Wybierz produkt ręcznie" onPress={() => { setShowModal("prd"); stopScan(); }} /> */}

    {/* get product info */}
    {showModal === "prd" && <>
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
        <View style={[s.center, ss.barCode]}>
          {hasPermissions === null && <BarText color="lightgray">Oczekuję na uprawnienia do aparatu</BarText>}
          {hasPermissions === false && <BarText color="lightgray">Brak dostępu do aparatu 😟</BarText>}
          {hasPermissions === true && scannerOn &&
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={ss.barCode}
            />}
        </View>
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
            style={s.popUpList}
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
            style={s.popUpList}
          />
          <SCButton icon="plus" title="Nowy" onPress={() => mllPrdChosen(0)} />
        </>}
      </>
      }
    </>}

    {/* write product and stock info */}
    {showModal === "stk" && <>
      <Header icon="flask">Produkt</Header>
      <View style={[s.margin, s.center]}>
        {/* jeżeli produkt istnieje, to do wyboru z listy, jeśli nie, to pola na nazwę itd */}
        {pId
        ? <>
          <SCInput type="dummy" label="Nazwa" value={pName} onChange={() => {}} />
          <SCInput type="dummy" label="EAN" value={pEan} onChange={() => {}} />
        </>
        : <>
          <SCInput label="Nazwa" value={pName} onChange={setPName} />
          <SCInput label="EAN" value={pEan} onChange={setPEan} />
          <SCSelect items={ingredients} label="Składnik" value={pIngredientId} onChange={mllIngChosen} />
          <SCInput type="numeric" label={`Ilość (${pIngredientUnit})`} value={pAmount} onChange={(val) => {setPAmount(val); setSAmount(sAmount || val)}} />
        </>
        }
      </View>

      <Header icon="box-open">Egzemplarz</Header>
      <View style={[s.margin, s.center]}>
        <SCInput label={`Ilość (${pIngredientUnit})`} value={sAmount} onChange={setSAmount} />
        <SCInput type="date" label="Data przydatności" value={sExpirationDate} onChange={setSExpirationDate} />
      </View>

      <View style={[s.flexRight, s.center]}>
        <SCButton icon="check" title="Potwierdź" onPress={handleSubmit} />
      </View>
    </>}
  </SCModal>
}

const ss = StyleSheet.create({
  barCode: {
    width: "100%",
    height: 50,
  }
})
