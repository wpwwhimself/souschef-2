import { FlatList, RefreshControl, Text, View } from "react-native"
import s from "../../assets/style"
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import PositionTile from "../PositionTile";
import { SCButton, SCModal, SCInput, SCSelect } from "../SCSpecifics";
import { rqDelete, rqGet, rqPatch, rqPost } from "../../helpers/SCFetch";
import { Product, SelectItem } from "../../types";
import HorizontalLine from "../HorizontalLine";
import { useToast } from "react-native-toast-notifications";
import { prepareSelectItems } from "../../helpers/Prepare";
import { FG_COLOR, LIGHT_COLOR } from "../../assets/constants";
import Header from "../Header";

export default function Products({navigation}){
  const isFocused = useIsFocused();
  const [ingredients, setIngredients] = useState([] as SelectItem[]);
  const [products, setProducts] = useState([] as Product[]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [eraserVisible, setEraserVisible] = useState(false);
  const [ingLoaderVisible, setIngLoaderVisible] = useState(true);
  const [prdLoaderVisible, setPrdLoaderVisible] = useState(true);
  const toast = useToast();

  const [pId, setPId] = useState(0);
  const [pEan, setPEan] = useState("");
  const [pName, setPName] = useState("");
  const [pIngredientId, setPIngredientId] = useState(0);
  const [pIngredientUnit, setPIngredientUnit] = useState("")
  const [pAmount, setPAmount] = useState(0);
  const [pEstExpirationDays, setPEstExpirationDays] = useState<number>(undefined);

  const getIngredients = async () => {
    setIngLoaderVisible(true);

    rqGet("ingredients")
      .then(ings => setIngredients(prepareSelectItems(ings, "name", "id")))
      .catch(err => toast.show("Problem: "+err.message, {type: "danger"}))
      .finally(() => setIngLoaderVisible(false))
    ;
  }

  const getData = async (ing_id: number) => {
    setPrdLoaderVisible(true);
    setPIngredientId(ing_id);

    // get ingredient unit
    rqGet("ingredients/" + ing_id)
      .then(ing => { setPIngredientUnit(ing.unit) })
      .catch(err => toast.show("Problem: "+err.message, {type: "danger"}))

    // product list based on the chosen ingredient
    rqGet("products/ingredient/" + ing_id)
      .then(prds => { setProducts(prds) })
      .catch(err => toast.show("Problem: "+err.message, {type: "danger"}))
      .finally(() => setPrdLoaderVisible(false))
    ;
  }

  useEffect(() => {
    setIngLoaderVisible(true);
    if(isFocused) {
      getIngredients();
      getData(pIngredientId);
    };
  }, [isFocused]);

  // modal
  const openEditor = (product?: Product) => {
    setPId(product?.id ?? 0);
    setPEan(product.ean);
    setPName(product.name);
    setPIngredientId(product.ingredient_id);
    setPAmount(product.amount);
    setPEstExpirationDays(product.est_expiration_days);

    setEditorVisible(true);
  }
  const handleSave = async () => {
    const toastId = toast.show("Zapisuję...");

    const editing = (pId != 0);
    const rq = (editing) ? rqPatch : rqPost;
    rq("products" + (editing ? `/${pId}` : ""), {
      ean: pEan,
      name: pName,
      ingredientId: pIngredientId,
      amount: pAmount,
      estExpirationDays: pEstExpirationDays,
    }).then(res => {
      toast.update(toastId, "Produkt gotowy", {type: "success"});
    }).catch(err => {
      toast.update(toastId, `Nie udało się zapisać: ${err.message}`, {type: "danger"})
    }).finally(() => {
      setEditorVisible(false)
      getData(pIngredientId)
    })
  }
  const handleDelete = async () => {
    const toastId = toast.show("Zapisuję...");

    rqDelete(`products/${pId}`)
      .then(res => {
        toast.update(toastId, "Produkt usunięty", {type: "success"});
      }).catch(err => {
        toast.update(toastId, `Nie udało się usunąć: ${err.message}`, {type: "danger"})
      }).finally(() => {
        setEraserVisible(false);
        setEditorVisible(false);
        getData(pIngredientId);
      })
  }

  return <View style={s.wrapper}>
    <Header icon="flask" level={1}>Produkty</Header>

    <View style={[s.margin, s.center]}>
      <SCSelect items={ingredients} label="Wybierz składnik" value={pIngredientId} onChange={getData} />
    </View>

    {/* list */}
    {!pIngredientId
    ? <></>
    : <>
      <FlatList data={products}
      refreshControl={<RefreshControl refreshing={prdLoaderVisible} onRefresh={() => getData(pIngredientId)} />}
      renderItem={({item}) =>
        <PositionTile
          icon={item.ingredient.category.symbol}
          title={item.name}
          buttons={<>
            <SCButton icon="wrench" color={LIGHT_COLOR} onPress={() => openEditor(item)} small />
          </>}
        />
      }
      ItemSeparatorComponent={() => <HorizontalLine />}
      ListEmptyComponent={<Header level={3}>Brak produktów</Header>}
      />
    </>
    }

    {/* editor */}
    <SCModal
      title={`${(pId != 0) ? "Edytuj" : "Dodaj"} produkt`}
      visible={editorVisible}
      onRequestClose={() => setEditorVisible(false)}
      >
      <View style={[s.margin, s.center]}>
        <SCInput label="Nazwa" value={pName} onChange={setPName} />
        <SCInput label="EAN" value={pEan} onChange={setPEan} />
        <SCSelect items={ingredients} label="Składnik" value={pIngredientId} onChange={setPIngredientId} />
        <SCInput type="numeric" label={`Ilość (${pIngredientUnit})`} value={pAmount} onChange={setPAmount} />
        <SCInput type="numeric" label="Szac. przydatność (dni)" value={pEstExpirationDays} onChange={setPEstExpirationDays} />
      </View>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="check" title="Zapisz" onPress={handleSave} />
        {pId != 0 && <SCButton icon="trash" color="red" title="Usuń" onPress={() => setEraserVisible(true)} />}
      </View>
    </SCModal>

    {/* eraser */}
    <SCModal
      title="Usuń produkt"
      visible={eraserVisible}
      onRequestClose={() => setEraserVisible(false)}
      >
      <Text style={{color: FG_COLOR}}>Czy na pewno chcesz usunąć produkt {pName}?</Text>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="fire-alt" title="Tak" color="red" onPress={handleDelete} />
      </View>
    </SCModal>
  </View>
}
