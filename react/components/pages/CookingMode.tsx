import { FlatList, RefreshControl, Text, View } from "react-native";
import s from "../../assets/style"
import Header from "../Header";
import { SCButton, SCInput, SCModal, SCRadio } from "../SCSpecifics";
import PositionTile from "../PositionTile";
import { useEffect, useState } from "react";
import { rqDelete, rqGet, rqPatch, rqPost } from "../../helpers/SCFetch";
import { useToast } from "react-native-toast-notifications";
import { useIsFocused } from "@react-navigation/native";
import HorizontalLine from "../HorizontalLine";
import AmountIndicator from "../AmountIndicator";
import AddStockModal from "../AddStockModal";
import { CookingProduct, Product, SelectItem } from "../../types";
import { FG_COLOR, LIGHT_COLOR } from "../../assets/constants";
import { prepareDashAmount } from "../../helpers/Prepare";
import { getKey } from "../../helpers/Storage";

export default function CookingMode(){
  const toast = useToast()
  const isFocused = useIsFocused()
  const [list, setList] = useState([])
  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [showModStockModal, setShowModStockModal] = useState(false)
  const [showAssignProductModal, setShowAssignProductModal] = useState(false)
  const [dangerModalMode, setDangerModalMode] = useState<false | "clear" | "clearOne" | "submit">(false)
  const [loaderVisible, setLoaderVisible] = useState(true)
  const [smallLoaderVisible, setSmallLoaderVisible] = useState(false)

  const [product, setProduct] = useState<CookingProduct>()
  const [products, setProducts] = useState<Product[]>()
  const [sAmount, setSAmount] = useState(0)
  const [dashLevels, setDashLevels] = useState<SelectItem[]>([
    {label: "nadal OK", value: 0},
    {label: "mało", value: 0.75},
    {label: "nic", value: 1},
  ])

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
    rqDelete(`cooking-products${product ? `/${product.id}` : ""}`)
      .then(res => {
        toast.update(toastId, "Produkt usunięty z listy", {type: "success"})
      }).catch(err => {
        toast.update(toastId, `Nie udało się usunąć produktu: ${err.message}`, {type: "danger"})
      }).finally(() => {
        setShowModStockModal(false)
        setDangerModalMode(false)
        setProduct(undefined)
        getData()
      })
  }

  const prepareChangeStock = (cookingProduct: CookingProduct) => {
    setProduct(cookingProduct)
    setSAmount(cookingProduct.amount)
    setDashLevels([
      {label: "nadal OK", value: 0},
      {label: "mało", value: prepareDashAmount(0.75, cookingProduct.stock_amount)},
      {label: "nic", value: prepareDashAmount(1, cookingProduct.stock_amount)},
    ])
    setShowModStockModal(true)
  }
  const changeStock = () => {
    const toastId = toast.show("Poprawiam...");
    rqPatch(`cooking-products/${product.id}`, {
      amount: sAmount,
    }).then(res => {
      toast.update(toastId, `Stan poprawiony na ${sAmount} ${product.ingredient.unit}`, {type: "success"})
    }).catch(err => {
      toast.update(toastId, `Nie udało się poprawić stanu: ${err.message}`, {type: "danger"})
    }).finally(() => {
      setShowModStockModal(false)
      setProduct(undefined)
      getData()
    })
  }

  const prepareAssignProduct = (cookingProduct: CookingProduct) => {
    setProduct(cookingProduct)
    setSmallLoaderVisible(true)
    rqGet(`products/ingredient/${cookingProduct.ingredient_id}/1`)
      .then((prds: Product[]) => {
        setProducts(prds)
        setShowAssignProductModal(true);
      }).catch(err => {
        toast.show("Problem: "+err.message, {type: "danger"})
      }).finally(() => {
        setSmallLoaderVisible(false)
      })
  }

  const dismissAssignProductModal = () => {
    setShowAssignProductModal(false)
    setProduct(undefined)
  }

  const assignProduct = (cooking_product_id: number, product_id: number) => {
    const toastId = toast.show("Przypisuję produkt...")
    rqPatch(`cooking-products/${cooking_product_id}/1`, {
      productId: product_id,
    }).then(res => {
      toast.update(toastId, `Produkt przypisany`, {type: "success"})
    }).catch(err => {
      toast.update(toastId, `Problem: ${err.message}`, {type: "danger"})
    }).finally(() => {
      setShowAssignProductModal(false)

      // ⚙️ update amount immediately after binding
      getKey("editAmountAfterCookingProductBound")
        .then(stgLvl => {
          if(stgLvl == 0) return;
          rqGet(`cooking-products/${cooking_product_id}`)
            .then((cp: CookingProduct) => {
              if(stgLvl == 1 && !cp.ingredient.dash) return;
              prepareChangeStock(cp)
            }).catch(err => {
              toast.show(`Problem: ${err.message}`, {type: "danger"})
            })
        })
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
      text: `Czy na pewno chcesz usunąć produkt ${product?.product?.name} z listy?`,
      confirm: clearList,
    },
    submit: {
      title: "Zatwierdzenie list",
      text: "Zaraz odejmiesz stany. Czy wszystko jest poprawnie?",
      confirm: submitList,
    },
  }

  return <View style={[s.wrapper]}>
    <Header icon="balance-scale" level={1}>Podliczanie</Header>

    <View style={{flex: 1}}>
    <FlatList data={list}
      refreshControl={<RefreshControl refreshing={loaderVisible} onRefresh={getData} />}
      renderItem={({item}: {item: CookingProduct}) => <PositionTile
        title={item.ingredient.name}
        subtitle={[
          item.product?.name,
          item.ingredient.dash && "🤏",
        ].filter(Boolean).join(" • ")}
        icon={item.ingredient.category.symbol}
        buttons={<>
          <AmountIndicator title="Do odjęcia"
            amount={item.amount}
            unit={item.ingredient.unit}
            maxAmount={item.stock_amount}
            expirationDate=""
          />
          {item.product_id
          ? <SCButton icon="wrench" color={LIGHT_COLOR} onPress={() => prepareChangeStock(item)} small />
          : <SCButton icon="plus" onPress={() => prepareAssignProduct(item)} small />
          }
        </>}
      />}
      ItemSeparatorComponent={() => <HorizontalLine />}
      ListEmptyComponent={<Header level={3}>Dodaj pierwszą pozycję</Header>}
    />
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
      title={`${product?.product?.name}: stan`}
      >
      <View style={[s.margin]}>
        <View style={[s.flexRight, s.center]}>
          <AmountIndicator title="Stan obecny"
            amount={product?.stock_amount}
            unit={product?.ingredient.unit}
            minAmount={product?.ingredient.minimal_amount}
            maxAmount={product?.product?.amount}
            expirationDate="" />
          {!product?.ingredient.dash && <>
            <SCButton icon="thermometer-empty" color={LIGHT_COLOR} onPress={() => setSAmount(0)} />
            <SCButton icon="thermometer-full" color={LIGHT_COLOR} onPress={() => setSAmount(product.stock_amount)} />
          </>}
        </View>
        {product?.ingredient.dash
          ? <SCRadio label="Ile zostało" items={dashLevels} value={sAmount} onChange={setSAmount} />
          : <SCInput type="numeric" label={`Ilość do odjęcia (${product?.ingredient.unit})`} value={sAmount} onChange={setSAmount} />
        }
      </View>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="check" title="Popraw" onPress={changeStock} />
        <SCButton icon="times" title="Wyczyść" onPress={() => setDangerModalMode("clearOne")} color="red" />
      </View>
    </SCModal>

    {/* cp assign product */}
    <SCModal
      visible={showAssignProductModal} loader={smallLoaderVisible}
      onRequestClose={dismissAssignProductModal}
      title={`Przypisz produkt do: ${product?.ingredient.name}`}
      >
      <FlatList data={products}
        renderItem={({item}: {item: Product}) =>
          <PositionTile
            icon={item.ingredient.category.symbol}
            title={item.name}
            subtitle={`${item.ean || "brak EAN"} • ${item.amount} ${item.ingredient.unit}`}
            buttons={<>
              <AmountIndicator amount={item.stock_items_sum_amount} unit={item.ingredient.unit} maxAmount={item.amount} minAmount={item.ingredient.minimal_amount} expirationDate="" />
              <SCButton color={LIGHT_COLOR} title="Wybierz" onPress={() => assignProduct(product.id, item.id)} />
            </>}
          />
        }
        ItemSeparatorComponent={() => <HorizontalLine />}
        ListEmptyComponent={<Header level={3}>Brak produktów dla tego EANu</Header>}
        style={s.popUpList}
        />
    </SCModal>

    {/* dangerbox */}
    <SCModal
      title={dangerModalMode && dangerModes[dangerModalMode].title}
      visible={dangerModalMode}
      onRequestClose={() => setDangerModalMode(false)}
      >
      <Text style={{color: FG_COLOR}}>{dangerModalMode && dangerModes[dangerModalMode ?? ""].text}</Text>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="fire-alt" title="Tak" color={dangerModalMode === "submit" ? "green" : "red"} onPress={dangerModalMode && dangerModes[dangerModalMode ?? ""].confirm} />
      </View>
    </SCModal>
  </View>
}
