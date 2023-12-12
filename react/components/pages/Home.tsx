import { FlatList, RefreshControl, SectionList, Text, View } from "react-native";
import s from "../../assets/style"
import Header from "../Header";
import { ACCENT_COLOR, FG_COLOR, LIGHT_COLOR } from "../../assets/constants";
import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { rqDelete, rqGet, rqPost } from "../../helpers/SCFetch";
import PositionTile from "../PositionTile";
import AmountIndicator from "../AmountIndicator";
import HorizontalLine from "../HorizontalLine";
import { useToast } from "react-native-toast-notifications";
import { SCButton, SCModal } from "../SCSpecifics";
import { Ingredient, Recipe, StockItem } from "../../types";
import AddStockModal from "../AddStockModal";

export default function Home({navigation}){
  const isFocused = useIsFocused();
  const toast = useToast();
  const [loaderForShoppingList, setLoaderForShoppingList] = useState(true)
  const [loaderForSpoiled, setLoaderForSpoiled] = useState(true)
  const [smallLoader, setSmallLoader] = useState(false)
  const [shoppingList, setShoppingList] = useState([])
  const [spoiled, setSpoiled] = useState<StockItem[]>([])
  const [throwOutModal, setThrowOutModal] = useState(false)
  const [stockItemToThrowOut, setStockItemToThrowOut] = useState(undefined)

  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [ingredientId, setIngredientId] = useState<number>(undefined)

  const [showRecipesModal, setShowRecipesModal] = useState(false)
  const [ingForRecipes, setIngForRecipes] = useState<Ingredient>()
  const [recipes, setRecipes] = useState<Recipe[]>([])

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

  const showRecipesForIngredient = (stockItem: StockItem) => {
    setIngForRecipes(stockItem.product.ingredient)
    setShowRecipesModal(true)
    setSmallLoader(true)

    rqGet(`recipes/ingredient/${stockItem.product.ingredient.id}`)
      .then(recipes => {
        setRecipes(recipes)
      }).catch(err => {
        toast.show(`Problem: ${err.message}`, {type: "danger"})
      }).finally(() => {
        setSmallLoader(false)
      })
  }
  const closeRecipesForIngredient = () => {
    setShowRecipesModal(false)
  }
  const goToCookingMode = (recipe: Recipe) => {
    closeRecipesForIngredient()
    navigation.navigate("RecipesHub", {screen: "Recipes", params: {recipe: recipe}})
  }

  const prepareAddStock = (ingId: number) => {
    setIngredientId(ingId)
    setShowAddStockModal(true)
  }

  return (
    <View style={[s.wrapper]}>
      <Header icon="house-user" level={1}>Na bieżąco</Header>
      <SectionList sections={content}
        renderSectionHeader={({section}) => <Header icon={section.icon}>{section.header}</Header>}
        refreshControl={<RefreshControl refreshing={loaderForShoppingList || loaderForSpoiled} onRefresh={getData} />}
        renderItem={({item, section}) => {
          const [buttonOn, setButtonOn] = useState(false)
          return section.name == "shoppingList"
          ? <PositionTile
            icon={item.category_symbol}
            title={item.name}
            grayedOut={buttonOn}
            buttons={<>
              <AmountIndicator amount={item.stock_items_sum_amount}
                unit={item.unit}
                minAmount={item.minimal_amount}
                expirationDate={item.stock_items_min_expiration_date}
                />
              <SCButton
                icon="check"
                onPress={() => setButtonOn(!buttonOn)}
                color={buttonOn ? "green" : LIGHT_COLOR}
                small
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
                icon="utensils"
                color={ACCENT_COLOR}
                onPress={() => showRecipesForIngredient(item)}
                small
                />
              <SCButton
                icon="trash"
                color={LIGHT_COLOR}
                onPress={() => prepareThrowOutSpoiled(item)}
                small
                />
            </>}
          />
        }}
        ItemSeparatorComponent={() => <HorizontalLine />}
        renderSectionFooter={({section}) => section.data.length === 0 &&
          <Header level={3}>{section.emptyNotice}</Header>
        }
        stickySectionHeadersEnabled={true}
      />

      <AddStockModal
        visible={showAddStockModal}
        onRequestClose={() => {setShowAddStockModal(false)}}
        ingId={ingredientId}
      />

      {/* recipe modal */}
      <SCModal
        title={`Przepisy z: ${ingForRecipes?.name}`}
        visible={showRecipesModal}
        onRequestClose={closeRecipesForIngredient}
        loader={smallLoader}
      >
        <FlatList data={recipes}
          renderItem={({item}) =>
            <PositionTile
              title={item.name}
              buttons={<>
                <AmountIndicator
                  amount={item.ingredients.length - item.stock_insufficient_count}
                  unit="skł."
                  maxAmount={item.ingredients.length}
                  amountAsFraction
                  highlightAt={1}
                  />
                <SCButton color={LIGHT_COLOR} onPress={() => goToCookingMode(item)} small />
              </>}
            />
          }
          ItemSeparatorComponent={() => <HorizontalLine />}
          ListEmptyComponent={<Header level={3}>Brak przepisów z tym składnikiem</Header>}
        />
      </SCModal>

      {/* danger modal */}
      <SCModal
        title="Wyrzuć produkt"
        visible={throwOutModal}
        onRequestClose={closeThrowOutSpoiledModal}
        >
        {stockItemToThrowOut && <Text style={{color: FG_COLOR}}>Czy na pewno chcesz usunąć produkt {stockItemToThrowOut.product.name}?</Text>}
        <View style={[s.flexRight, s.center]}>
          <SCButton icon="fire-alt" title="Tak" color="red" onPress={throwOutSpoiled} />
        </View>
      </SCModal>
    </View>
  )
}
