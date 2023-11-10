import { useState, useEffect } from 'react'
import { View, StyleSheet, FlatList } from "react-native"
import Header from "./Header"
import s from "../assets/style"
import { BarCodeScanner } from "expo-barcode-scanner"
import { rqGet, rqPost } from '../helpers/SCFetch'
import { Ingredient, Product, SelectItem } from '../types'
import { SCButton, SCModal, SCInput, SCSelect, SCRadio } from './SCSpecifics'
import { prepareDashAmount, prepareSelectItems } from '../helpers/Prepare'
import Loader from './Loader'
import PositionTile from './PositionTile'
import HorizontalLine from './HorizontalLine'
import { useToast } from "react-native-toast-notifications";
import moment from 'moment'
import AmountIndicator from './AmountIndicator'
import { LIGHT_COLOR } from "../assets/constants"

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
  mode?: "stock" | "cookingMode",
}

export default function AddStockModal({visible, onRequestClose, ean, ingId, mode = "stock"}: BSInput){
  const [hasPermissions, setHasPermissions] = useState(null)
  const [scannerOn, setScannerOn] = useState(false)
  const [showModal, setShowModal] = useState<false | "prd" | "stk">(false)
  const [manualLookupMode, setManualLookupMode] = useState<false | "ean" | "list">(false)
  const [loaderVisible, setLoaderVisible] = useState(false)
  const toast = useToast();

  const [ingredients, setIngredients] = useState<SelectItem[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // product parameters
  const [pId, setPId] = useState(0)
  const [pName, setPName] = useState("")
  const [pEan, setPEan] = useState("")
  const [pIngredientId, setPIngredientId] = useState(0)
  const [pIngredientUnit, setPIngredientUnit] = useState("")
  const [pIngredientDash, setPIngredientDash] = useState<boolean>()
  const [pAmount, setPAmount] = useState<number>(undefined)
  const [pEstExpirationDays, setPEstExpirationDays] = useState<number>(undefined)
  const [pStockItemsSumAmount, setPStockItemsSumAmount] = useState(0)
  const [dashLevels, setDashLevels] = useState<SelectItem[]>([
    {label: "nadal OK", value: 0},
    {label: "mało", value: 0.75},
    {label: "nic", value: 1},
  ])

  // stock item parameters
  const [sAmount, setSAmount] = useState<number>(undefined)
  const [sExpirationDate, setSExpirationDate] = useState<string>(undefined)

  const prepareEan = (ean: string) => {
    setPEan(ean);
  }
  const prepareIngredient = (ingId: number) => {
    setPIngredientId(ingId)

    rqGet("ingredients/" + ingId)
      .then((ing: Ingredient) => {
        setPIngredientUnit(ing.unit)
        setPIngredientDash(ing.dash)
      }).catch(err => toast.show("Problem: "+err.message, {type: "danger"}))
  }

  useEffect(() => {
    if(visible){
      setShowModal("prd")
      openManualLookup("ean")
      openScanner(true)
      prepareEan(ean)
      prepareIngredient(ingId)
    }else{
      setShowModal(false)
    }
  }, [visible])

  const handleBarCodeScanned = async ({type, data}) => {
    openScanner(false);
    mleEanReady(data);
  }

  const openManualLookup = async (lookupMode: "ean" | "list") => {
    mllIngChosen(pIngredientId);

    rqGet("ingredients")
      .then(ings => { setIngredients(prepareSelectItems(ings, "name", "id")) })
      .catch(err => toast.show(`Problem z szukaniem składników: ${err.message}`, {type: "danger"}))
    ;

    setShowModal("prd");
    setManualLookupMode(lookupMode);
  }

  const openScanner = (on: boolean) => {
    if(on){
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
    prepareEan(ean);
    if(ean.length === 0) return;
    setLoaderVisible(true);

    rqGet("products/ean/" + ean + (mode === "cookingMode" ? "/1" : ""))
      .then(prds => { setProducts(prds) })
      .catch(err => toast.show("Problem: "+err.message, {type: "danger"}))
      .finally(() => setLoaderVisible(false))
    ;
  }

  const mllIngChosen = async (ing_id: number) => {
    setLoaderVisible(true);
    prepareIngredient(ing_id);

    // product list based on the chosen ingredient
    rqGet("products/ingredient/" + ing_id + (mode === "cookingMode" ? "/1" : ""))
      .then(prds => { setProducts(prds) })
      .catch(err => toast.show("Problem: "+err.message, {type: "danger"}))
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
    setPIngredientUnit(product?.ingredient.unit || pIngredientUnit)
    setPIngredientDash(product?.ingredient.dash || pIngredientDash)
    setDashLevels([
      {label: "nadal OK", value: 0},
      {label: "mało", value: prepareDashAmount(0.75, product?.stock_items_sum_amount)},
      {label: "nic", value: prepareDashAmount(1, product?.stock_items_sum_amount)},
    ])
    setPStockItemsSumAmount(product?.stock_items_sum_amount)

    setSAmount(undefined)
    setSExpirationDate(
      product?.est_expiration_days != 0
      ? moment().add(product?.est_expiration_days, 'd').format("YYYY-MM-DD")
      : undefined
    );

    setShowModal("stk");
  }

  const handleSubmit = async () => {
    const toastId = toast.show("Zapisuję...");

    switch(mode){
      case "cookingMode":
        rqPost("cooking-products", {
          productId: pId,
          amount: sAmount,
        }).then(res => {
          toast.update(toastId, "Pozycja dodana", {type: "success"});
        }).catch(err => {
          toast.update(toastId, `Nie udało się zapisać: ${err.message}`, {type: "danger"})
        }).finally(() => {
          setShowModal(false)
          onRequestClose()
        })
        break;
      case "stock":
      default:
        // create product if needed
        (async () => (!pId)
        ? rqPost("products", {
            ean: pEan,
            name: pName,
            ingredientId: pIngredientId,
            amount: pAmount,
            estExpirationDays: pEstExpirationDays,
          })
        : rqGet("products/" + pId)
        )().then(res => {
          if(!res.id) throw new Error("Błąd w tworzeniu produktu")
          return res
        })
        .then(product => // create stock item
          rqPost("stock", {
            productId: product.id,
            amount: sAmount,
            expirationDate: sExpirationDate,
          })
        ).then(res => {
          toast.update(toastId, "Pozycja dodana", {type: "success"});
        }).catch(err => {
          toast.update(toastId, `Nie udało się zapisać: ${err.message}`, {type: "danger"})
        }).finally(() => {
          setShowModal(false)
          onRequestClose()
        })
    }
  }

  return <SCModal
    visible={visible}
    title={
      showModal === "prd" ? "Wybierz produkt"
      : showModal === "stk" ? "Dane o produkcie"
      : undefined
    }
    onRequestClose={onRequestClose}
    >
    {/* <SCButton icon="wrench" title="Wybierz produkt ręcznie" onPress={() => { setShowModal("prd"); stopScan(); }} /> */}

    {/* get product info */}
    {showModal === "prd" && <>
      {manualLookupMode === "ean" && <>
        {/* scanner */
        scannerOn &&
        <>
          {hasPermissions === null && <Header level={3}>Oczekuję na uprawnienia do aparatu</Header>}
          {hasPermissions === false && <Header level={3}>Brak dostępu do aparatu 😟</Header>}
          {hasPermissions === true && scannerOn &&
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={ss.barCode}
            />}
          <View style={[s.flexRight, s.center]}>
            <SCButton icon="barcode" title="Wpisz EAN ręcznie" onPress={() => {openScanner(false)}} />
            <SCButton icon="box" title="Po składniku" onPress={() => openManualLookup("list")} />
          </View>
        </>
        }

        {/* lookup by EAN */
        !scannerOn &&
        <>
          <View style={[s.flexRight, s.center]}>
            <SCInput label="EAN" value={pEan} onChange={mleEanReady} />
          </View>
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
                  subtitle={`${item.ingredient.name} • ${item.ean || "brak EAN"}`}
                  buttons={<>
                    {mode === "cookingMode" && <AmountIndicator amount={item.stock_items_sum_amount} unit={item.ingredient.unit} maxAmount={item.amount} minAmount={item.ingredient.minimal_amount} expirationDate="" />}
                    <SCButton color={LIGHT_COLOR} title="Wybierz" onPress={() => mllPrdChosen(item.id)} />
                  </>}
                />
              }
              ItemSeparatorComponent={() => <HorizontalLine />}
              ListEmptyComponent={<Header level={3}>Brak produktów dla tego EANu</Header>}
              style={s.popUpList}
            />
            {mode !== "cookingMode" && <SCButton icon="plus" title="Nowy" onPress={() => mllPrdChosen(0, pEan)} />}
          </>}
        </>
        }
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
                  {mode === "cookingMode" && <AmountIndicator amount={item.stock_items_sum_amount} unit={item.ingredient.unit} maxAmount={item.amount} minAmount={item.ingredient.minimal_amount} expirationDate="" />}
                  <SCButton color={LIGHT_COLOR} title="Wybierz" onPress={() => mllPrdChosen(item.id)} />
                </>}
              />
            }
            ItemSeparatorComponent={() => <HorizontalLine />}
            ListEmptyComponent={<Header level={3}>Brak produktów dla tego składnika</Header>}
            style={s.popUpList}
          />
          {mode !== "cookingMode" && <SCButton icon="plus" title="Nowy" onPress={() => mllPrdChosen(0)} />}
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
        {mode === "cookingMode" && <View style={[s.flexRight, s.center]}>
          <AmountIndicator title="Stan obecny"
            amount={pStockItemsSumAmount}
            unit={pIngredientUnit}
            maxAmount={pAmount}
            expirationDate="" />
          <SCButton icon="thermometer-empty" color={LIGHT_COLOR} onPress={() => setSAmount(0)} />
          <SCButton icon="thermometer-full" color={LIGHT_COLOR} onPress={() => setSAmount(pStockItemsSumAmount)} />
        </View>}
        {mode === "cookingMode" && pIngredientDash
        ? <SCRadio label={`Ilość (${pIngredientUnit})`} items={dashLevels} value={sAmount} onChange={setSAmount} />
        : <SCInput type="numeric" label={`Ilość (${pIngredientUnit})`} value={sAmount} onChange={setSAmount} />
        }
        {mode !== "cookingMode" && <SCInput type="date" label="Data przydatności" value={sExpirationDate} onChange={setSExpirationDate} />}
      </View>

      <View style={[s.flexRight, s.center]}>
        <SCButton icon="check" title="Potwierdź" onPress={handleSubmit} />
      </View>
    </>}
  </SCModal>
}

const ss = StyleSheet.create({
  barCode: {
    height: "85%",
  }
})
