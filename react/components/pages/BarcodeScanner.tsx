import { useState, useEffect } from 'react'
import { View, Text, Button, StyleSheet, FlatList } from "react-native"
import Header from "../Header"
import s from "../../assets/style"
import { BarCodeScanner } from "expo-barcode-scanner"
import { getEANToken, getPassword } from '../../helpers/PasswordStorage'
import { API_EAN_URL, API_SOUSCHEF_URL } from '../../assets/constants'
import BarText from '../BarText'
import { rqGet, rqPost } from '../../helpers/SCFetch'
import { Product, SelectItem } from '../../types'
import TitledText from '../TitledText'
import { SCButton, SCModal, SCInput, SCSelect } from '../SCSpecifics'
import { prepareSelectItems } from '../../helpers/Prepare'
import Loader from '../Loader'
import PositionTile from '../PositionTile'
import HorizontalLine from '../HorizontalLine'
import { useToast } from "react-native-toast-notifications";
import { useIsFocused } from '@react-navigation/native'

interface UPCProduct{
  title: string,
  barcode: string,
  metadata: {
    quantity: string,
  },
}

const PRODUCT_NOT_FOUND_ERROR = "This product doesn't exist in the database";

export default function BarcodeScanner({navigation}){
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
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermissions(status === "granted");
    })();
  }, [])

  const handleBarCodeScanned = async ({type, data}) => {
    setScannerOn(false);
    const token = await getEANToken();

    rqGet(API_EAN_URL + `product/${data}`, {apikey: token})
      .then(res => res.data)
      .then(product => {
        setPEan(product.barcode);
        openManualLookup("ean");
      })
      .catch(err => console.error(err));
  }

  const startScan = () => {
    setScannerOn(true)
    setShowModal(false)
    setManualLookupMode(false)
  };
  const stopScan = () => {
    setScannerOn(false)
  }

  useEffect(() => {
    isFocused ? startScan() : stopScan();
  }, [isFocused])

  const openManualLookup = async (mode: "ean" | "list") => {
    const magic_word = await getPassword();
    rqGet(API_SOUSCHEF_URL + "ingredient", {
      magic_word: magic_word,
    })
      .then(res => res.data)
      .then(ings => { setIngredients(prepareSelectItems(ings, "name", "id")) })
      .catch(err => console.error(err))
    ;
    setPIngredientId(0);
    setPEan("");
    setManualLookupMode(mode);
  }

  const mleEanReady = async (ean: string) => {
    setPEan(ean);
    if(ean.length === 0) return;
    setLoaderVisible(true);

    const magic_word = await getPassword();
    rqGet(API_SOUSCHEF_URL + "product/ean/" + ean, {
      magic_word: magic_word,
    })
      .then(res => res.data)
      .then(prds => { setProducts(prds) })
      .catch(err => console.error(err))
      .finally(() => setLoaderVisible(false))
    ;
  }

  const mllIngChosen = async (ing_id: number) => {
    setLoaderVisible(true);
    setPIngredientId(ing_id);

    // get ingredient unit
    const magic_word = await getPassword();
    rqGet(API_SOUSCHEF_URL + "ingredient/" + ing_id, {
      magic_word: magic_word,
    })
      .then(res => res.data)
      .then(ing => { setPIngredientUnit(ing.unit) })
      .catch(err => console.error(err))

    // product list based on the chosen ingredient
    rqGet(API_SOUSCHEF_URL + "product/ingredient/" + ing_id, {
      magic_word: magic_word,
    })
      .then(res => res.data)
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

    setShowModal("stk");
  }

  const handleSubmit = async () => {
    const toastId = toast.show("Zapisuję...");

    const magic_word = await getPassword();
    // create product if needed
    (async () => (!pId)
    ? rqPost(API_SOUSCHEF_URL + "product", {
        magic_word: magic_word,
        ean: pEan,
        name: pName,
        ingredientId: pIngredientId,
        amount: pAmount,
        estExpirationDays: pEstExpirationDays,
      })
    : rqGet(API_SOUSCHEF_URL + "product/" + pId, {
        magic_word: magic_word
      })
    )().then(res => {
      if(res.status >= 300) throw new Error("Błąd w tworzeniu produktu")
      return res.data
    })
    .then(product => { // create stock item
      rqPost(API_SOUSCHEF_URL + "stock", {
        magic_word: magic_word,
        productId: product.id,
        amount: sAmount || pAmount,
        expirationDate: sExpirationDate,
      }).then(res => res.data)
    }).then(res => {
      console.log(res);
      toast.update(toastId, "Pozycja dodana", {type: "success"});
    }).catch(err => {
      console.error(err)
      toast.update(toastId, `Nie udało się zapisać: ${err.message}`, {type: "danger"})
    }).finally(() => {
      setShowModal(false);
    })
  }

  return <View style={s.wrapper}>
    <View style={[s.center, ss.barCode]}>
      {hasPermissions === null && <BarText color="lightgray">Oczekuję na uprawnienia do aparatu</BarText>}
      {hasPermissions === false && <BarText color="lightgray">Brak dostępu do aparatu 😟</BarText>}
      {hasPermissions === true && scannerOn &&
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={ss.barCode}
        />}
    </View>

    <SCButton icon="wrench" title="Wybierz produkt ręcznie" onPress={() => { setShowModal("prd"); stopScan(); }} />

    {/* get product info */}
    <SCModal
      visible={showModal === "prd"}
      title="Wybierz produkt"
      onRequestClose={startScan}
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

    {/* write product and stock info */}
    <SCModal
      visible={showModal === "stk"}
      title="Dane o produkcie"
      onRequestClose={startScan}
      >
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
          <SCSelect items={ingredients} label="Składnik" value={pIngredientId} onChange={setPIngredientId} />
          <SCInput type="numeric" label={`Ilość (${pIngredientUnit})`} value={pAmount} onChange={setPAmount} />
        </>
        }
      </View>

      <Header icon="box-open">Egzemplarz</Header>
      <View style={[s.margin, s.center]}>
        <SCInput label={`Ilość (${pIngredientUnit})`} value={sAmount || pAmount} onChange={setSAmount} />
        <SCInput type="date" label="Data przydatności" value={sExpirationDate} onChange={setSExpirationDate} />
      </View>

      <SCButton icon="check" title="Potwierdź" onPress={handleSubmit} />
    </SCModal>
  </View>
}

const ss = StyleSheet.create({
  barCode: {
    width: "100%",
    height: "90%",
  }
})
