import { FlatList, RefreshControl, SectionList, View } from "react-native"
import Header from "../Header"
import s from "../../assets/style"
import { useState, useEffect } from "react"
import PositionTile from "../PositionTile"
import HorizontalLine from "../HorizontalLine"
import { rqDelete, rqGet, rqPatch } from "../../helpers/SCFetch"
import { FG_COLOR, LIGHT_COLOR } from "../../assets/constants"
import { useIsFocused } from "@react-navigation/native"
import AmountIndicator from "../AmountIndicator"
import { SCButton, SCInput, SCModal } from "../SCSpecifics"
import { Ingredient, Recipe, StockItem } from "../../types"
import { useToast } from "react-native-toast-notifications";
import { Text } from "react-native"
import AddStockModal from "../AddStockModal"

export default function Stock({navigation}){
  const isFocused = useIsFocused()
  const [stockFreezer, setStockFreezer] = useState([])
  const [stockCupboard, setStockCupboard] = useState([])
  const [loaderVisible, setLoaderVisible] = useState(true)
  const [smallLoaderVisible, setSmallLoaderVisible] = useState(false)
  const [stockEditor, setStockEditor] = useState(false)
  const [stockDrilldown, setStockDrilldown] = useState(false)
  const [stockEraser, setStockEraser] = useState(false)
  const toast = useToast();
  const [showAddStockModal, setShowAddStockModal] = useState(false)

  const [iName, setIName] = useState("")
  const [iDash, setIDash] = useState<boolean>()
  const [stockDdDetails, setStockDdDetails] = useState([])

  // stock item parameters
  const [sId, setSId] = useState(0)
  const [sAmount, setSAmount] = useState(0)
  const [sExpirationDate, setSExpirationDate] = useState("")
  const [pUnit, setPUnit] = useState("")
  const [ingId, setIngId] = useState<number>(undefined)

  const [showRecipesModal, setShowRecipesModal] = useState(false)
  const [ingForRecipes, setIngForRecipes] = useState<Ingredient>()
  const [recipes, setRecipes] = useState<Recipe[]>([])

  const getData = async () => {
    setLoaderVisible(true);

    rqGet("stock/ingredient/0")
      .then(items => {
        const freezables = items.filter(ing => ing.freezable)
        setStockFreezer(freezables)
        setStockCupboard(items.filter(ing => !freezables.includes(ing)))
      })
      .catch(err => toast.show("Problem: "+err.message, {type: "danger"}))
      .finally(() => setLoaderVisible(false))
  }

  const drilldown = async (ing_id: number) => {
    setSmallLoaderVisible(true)
    setStockDrilldown(true)
    rqGet("stock/ingredient/" + ing_id)
      .then((items) => {
        setIName(items[0].product.ingredient.name)
        setIDash(items[0].product.ingredient.dash)
        setStockDdDetails(items)
      })
      .catch(err => toast.show("Problem: "+err.message, {type: "danger"}))
      .finally(() => setSmallLoaderVisible(false))
  }

  const addStockByIngredient = (ingId: number) => {
    setIngId(ingId)
    setShowAddStockModal(true)
  }

  const handleChangeDashAmount = (value: string) => {
    setSAmount(parseFloat(value) + +((Math.floor(sAmount) || 0) !== sAmount) * 0.25)
  }
  const handleChangeDashAmountRemainder = (remainder_present: boolean) => {
    setSAmount((Math.floor(sAmount) || 0) + +remainder_present * 0.25)
  }

  const editStock = async (stock_id: number, unit: string) => {
    setSmallLoaderVisible(true)
    setStockEditor(true)
    rqGet("stock/" + stock_id)
      .then((item: StockItem) => {
        setSId(item.id)
        setSAmount(item.amount)
        setSExpirationDate(item.expiration_date)
        setPUnit(unit)
      })
      .catch(err => toast.show("Problem: "+err.message, {type: "danger"}))
      .finally(() => setSmallLoaderVisible(false))
  }
  const handleSubmit = async () => {
    const toastId = toast.show("Zapisuję...");

    rqPatch("stock/" + sId, {
      amount: sAmount || 0,
      expirationDate: sExpirationDate,
    })
    .then(res => {
      toast.update(toastId, "Stan poprawiony", {type: "success"});
      getData();
    })
    .catch(err => {
      toast.update(toastId, `Nie udało się zapisać: ${err.message}`, {type: "danger"})
    })
    .finally(() => {
      setStockEditor(false);
      setStockDdDetails([]);
      setIName("");
      setIDash(undefined);
      setStockDrilldown(false);
    })
  }
  const handleDelete = async () => {
    const toastId = toast.show("Czyszczę...");

    rqDelete("stock/" + sId)
    .then(res => {
      toast.update(toastId, "Stan poprawiony", {type: "success"});
      getData();
    })
    .catch(err => {
      toast.update(toastId, `Nie udało się zapisać: ${err.message}`, {type: "danger"})
    })
    .finally(() => {
      setStockEditor(false);
      setStockDdDetails([]);
      setIName("");
      setIDash(undefined);
      setStockDrilldown(false);
      setStockEraser(false);
    })
  }

  const showRecipesForIngredient = (ingredient: Ingredient) => {
    setIngForRecipes(ingredient)
    setShowRecipesModal(true)
    setSmallLoaderVisible(true)

    rqGet(`recipes/ingredient/${ingredient.id}`)
      .then(recipes => {
        setRecipes(recipes)
      }).catch(err => {
        toast.show(`Problem: ${err.message}`, {type: "danger"})
      }).finally(() => {
        setSmallLoaderVisible(false)
      })
  }
  const closeRecipesForIngredient = () => {
    setShowRecipesModal(false)
  }
  const goToCookingMode = (recipe: Recipe) => {
    closeRecipesForIngredient()
    navigation.navigate("RecipesHub", {screen: "Recipes", params: {recipe: recipe}})
  }

  useEffect(() => {
    if(isFocused && !showAddStockModal) getData();
  }, [isFocused, showAddStockModal]);

  interface ContentEl{
    header: string,
    icon: string,
    data: any[],
    color: string,
    emptyNotice: string,
  }
  const content: ContentEl[] = [
    {
      header: "Lodówka",
      icon: "cubes",
      data: [stockFreezer],
      color: "#0099ff",
      emptyNotice: "Lodówka pusta",
    },
    {
      header: "Szafka",
      icon: "cookie-bite",
      data: [stockCupboard],
      color: "#ff9900",
      emptyNotice: "Szafka pusta",
    },
  ]

  return <View style={s.wrapper}>
    <Header icon="box-open" level={1}>Stan</Header>
    <SCButton icon="plus" title="Dodaj wpis" onPress={() => setShowAddStockModal(true)} />
    <AddStockModal
      visible={showAddStockModal}
      onRequestClose={() => {setShowAddStockModal(false); setIngId(undefined);}}
      ingId={ingId}
    />

    <SectionList sections={content}
      renderSectionHeader={({section}) => <Header icon={section.icon}>{section.header}</Header>}
      refreshControl={<RefreshControl refreshing={loaderVisible} onRefresh={getData} />}
      renderItem={({item, section}) => <FlatList data={item}
        numColumns={3}
        renderItem={({item}) => <PositionTile tile
          icon={item.category.symbol}
          title={item.name}
          numbers={<AmountIndicator amount={item.stock_items_sum_amount}
            unit={item.unit}
            minAmount={item.minimal_amount}
            expirationDate={item.stock_items_min_expiration_date}
          />}
          buttons={<>
            <SCButton icon="utensils" color={section.color} onPress={() => showRecipesForIngredient(item)} small />
            <SCButton icon="plus" color={section.color} onPress={() => addStockByIngredient(item.id)} small />
            <SCButton color={LIGHT_COLOR} onPress={() => drilldown(item.id)} small />
          </>}
        />}
      />}
      ItemSeparatorComponent={() => <HorizontalLine />}
      renderSectionFooter={({section}) => section.data[0].length === 0 &&
        <Header level={3}>{section.emptyNotice}</Header>
      }
      stickySectionHeadersEnabled={true}
    />

    <SCModal
      visible={stockDrilldown} loader={smallLoaderVisible}
      title={`${iName}: produkty`}
      onRequestClose={() => setStockDrilldown(false)}
      >
      <FlatList data={stockDdDetails}
        renderItem={({item}) => <PositionTile
          icon={item.product.ingredient.category.symbol}
          title={item.product.name}
          buttons={<>
            <AmountIndicator amount={item.amount}
              unit={item.product.ingredient.unit}
              maxAmount={item.product.amount}
              minAmount={item.product.ingredient.minimal_amount}
              expirationDate={item.expiration_date}
              />
            <SCButton icon="wrench" color={LIGHT_COLOR} onPress={() => editStock(item.id, item.product.ingredient.unit)} small />
          </>}
        />}
        ItemSeparatorComponent={() => <HorizontalLine />}
      />
    </SCModal>

    {/* recipe modal */}
    <SCModal
      title={`Przepisy z: ${ingForRecipes?.name}`}
      visible={showRecipesModal}
      onRequestClose={closeRecipesForIngredient}
      loader={smallLoaderVisible}
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

    <SCModal
      visible={stockEditor} loader={smallLoaderVisible}
      title="Edytuj stan"
      onRequestClose={() => setStockEditor(false)}
      >
      <View style={[s.margin, s.center]}>
        {iDash
        ? <>
          <SCInput type="numeric" label={`Ilość pełnych (${pUnit})`} value={Math.floor(sAmount) || 0} onChange={handleChangeDashAmount} />
          <SCInput type="checkbox" label={`Dodaj otwarte (${pUnit})`} value={sAmount && (Math.floor(sAmount) || 0) !== sAmount} onChange={handleChangeDashAmountRemainder} />
        </>
        : <SCInput type="numeric" label={`Ilość (${pUnit})`} value={sAmount} onChange={setSAmount} />
        }
        <SCInput type="date" label="Data przydatności" value={sExpirationDate} onChange={setSExpirationDate} />
      </View>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="check" title="Zatwierdź" onPress={handleSubmit} />
        <SCButton icon="trash" color="red" title="Usuń" onPress={() => setStockEraser(true)} />
      </View>
    </SCModal>

    {/* eraser */}
    <SCModal
      title="Usuń stan"
      visible={stockEraser}
      onRequestClose={() => setStockEraser(false)}
      >
      <Text style={{color: FG_COLOR}}>Czy na pewno chcesz wyczyścić ten produkt?</Text>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="fire-alt" title="Tak" color="red" onPress={handleDelete} />
      </View>
    </SCModal>
  </View>
}
