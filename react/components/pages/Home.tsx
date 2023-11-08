import { RefreshControl, SectionList, Text, View } from "react-native";
import s from "../../assets/style"
import Header from "../Header";
import BarText from "../BarText";
import { ACCENT_COLOR, LIGHT_COLOR } from "../../assets/constants";
import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { rqDelete, rqGet } from "../../helpers/SCFetch";
import PositionTile from "../PositionTile";
import AmountIndicator from "../AmountIndicator";
import HorizontalLine from "../HorizontalLine";
import { useToast } from "react-native-toast-notifications";
import { SCButton, SCModal } from "../SCSpecifics";
import { StockItem } from "../../types";
import AddStockModal from "../AddStockModal";

export default function Home(){
  const isFocused = useIsFocused();
  const toast = useToast();
  const [loaderForShoppingList, setLoaderForShoppingList] = useState(true)
  const [loaderForSpoiled, setLoaderForSpoiled] = useState(true)
  const [shoppingList, setShoppingList] = useState([])
  const [spoiled, setSpoiled] = useState([])
  const [throwOutModal, setThrowOutModal] = useState(false)
  const [stockItemToThrowOut, setStockItemToThrowOut] = useState(undefined)

  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [ingredientId, setIngredientId] = useState<number>(undefined)

  const getData = async () => {
    setLoaderForShoppingList(true);
    setLoaderForSpoiled(true);

    rqGet("stock/status/lowStock")
      .then(items => {
        setShoppingList(items)
      })
      .catch(err => toast.show(err.message, {type: "danger"}))
      .finally(() => setLoaderForShoppingList(false))

    rqGet("stock/status/spoiled")
      .then(items => {
        setSpoiled(items)
      })
      .catch(err => toast.show(err.message, {type: "danger"}))
      .finally(() => setLoaderForSpoiled(false))
  }

  interface ContentEl{
    name: string,
    header: string,
    icon: string,
    data: any[],
    emptyNotice: string,
  }
  const content: ContentEl[] = [
    {
      name: "shoppingList",
      header: "Lista zakupów",
      icon: "shopping-cart",
      data: shoppingList,
      emptyNotice: "Niczego nam nie brakuje",
    },
    {
      name: "spoiled",
      header: "Do wyrzucenia",
      icon: "trash",
      data: spoiled,
      emptyNotice: "Wszystko jest (jeszcze) świeże",
    },
  ]

  useEffect(() => {
    if(isFocused && !showAddStockModal) getData();
  }, [isFocused, showAddStockModal]);

  const prepareThrowOutSpoiled = (stock_item: StockItem) => {
    setStockItemToThrowOut(stock_item)
    setThrowOutModal(true);
  }
  const throwOutSpoiled = () => {
    rqDelete("stock/" + stockItemToThrowOut.id)
      .then(res => {
        getData();
        toast.show("Produkt wyrzucony", {type: "success"})
      })
      .catch(err => toast.show("Nie udało się usunąć, " + err.message, {type: "danger"}))
      .finally(() => closeThrowOutSpoiledModal())
  }
  const closeThrowOutSpoiledModal = () => {
    setThrowOutModal(false)
    setStockItemToThrowOut(false)
  }

  const prepareAddStock = (ingId: number) => {
    setIngredientId(ingId)
    setShowAddStockModal(true)
  }

  return (
    <View style={[s.wrapper]}>
      <SectionList sections={content}
        renderSectionHeader={({section}) => <Header icon={section.icon} color={ACCENT_COLOR} center>{section.header}</Header>}
        refreshControl={<RefreshControl refreshing={loaderForShoppingList || loaderForSpoiled} onRefresh={getData} />}
        renderItem={({item, section}) => section.name == "shoppingList"
          ? <PositionTile
            icon={item.category_symbol}
            title={item.name}
            buttons={<>
              <AmountIndicator amount={item.stock_items_sum_amount}
                unit={item.unit}
                minAmount={item.minimal_amount}
                expirationDate={item.stock_items_min_expiration_date}
                />
              <SCButton
                icon="shopping-cart"
                onPress={() => prepareAddStock(item.id)}
                small
                />
            </>}
          />
          : <PositionTile
            icon={item.product.ingredient.category.symbol}
            title={item.product.name}
            subtitle={item.product.ingredient.name}
            buttons={<>
              <AmountIndicator amount={item.amount}
                maxAmount={item.product.amount}
                unit={item.product.ingredient.unit}
                minAmount={item.product.ingredient.minimal_amount}
                expirationDate={item.expiration_date}
                />
              <SCButton
                icon="trash"
                color={LIGHT_COLOR}
                onPress={() => prepareThrowOutSpoiled(item)}
                small
                />
            </>}
          />
        }
        ItemSeparatorComponent={() => <HorizontalLine />}
        renderSectionFooter={({section}) => section.data.length === 0 &&
          <BarText color={LIGHT_COLOR} small>{section.emptyNotice}</BarText>
        }
      />

      <AddStockModal
        visible={showAddStockModal}
        onRequestClose={() => {setShowAddStockModal(false)}}
        ingId={ingredientId}
      />

      {/* danger modal */}
      <SCModal
        title="Wyrzuć produkt"
        visible={throwOutModal}
        onRequestClose={closeThrowOutSpoiledModal}
        >
        {stockItemToThrowOut && <Text>Czy na pewno chcesz usunąć produkt {stockItemToThrowOut.product.name}?</Text>}
        <View style={[s.flexRight, s.center]}>
          <SCButton icon="fire-alt" title="Tak" color="red" onPress={throwOutSpoiled} />
        </View>
      </SCModal>
    </View>
  )
}
