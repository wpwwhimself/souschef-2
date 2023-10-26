import { FlatList, Text, View } from "react-native"
import s from "../../assets/style"
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { getPassword } from "../../helpers/Storage";
import { API_SOUSCHEF_URL } from "../../assets/constants";
import PositionTile from "../PositionTile";
import BarText from "../BarText";
import { SCButton, SCModal, SCInput, SCSelect } from "../SCSpecifics";
import { rqDelete, rqGet, rqPatch, rqPost } from "../../helpers/SCFetch";
import { Product, SelectItem } from "../../types";
import HorizontalLine from "../HorizontalLine";
import Loader from "../Loader";
import TopHeader from "../TopHeader";
import { useToast } from "react-native-toast-notifications";
import { prepareSelectItems } from "../../helpers/Prepare";

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

    const magic_word = await getPassword();
    rqGet(API_SOUSCHEF_URL + "ingredient", {
      magic_word: magic_word,
    })
      .then(ings => setIngredients(prepareSelectItems(ings, "name", "id")))
      .catch(err => console.error(err))
      .finally(() => setIngLoaderVisible(false))
    ;
  }

  const getData = async (ing_id: number) => {
    setPrdLoaderVisible(true);
    setPIngredientId(ing_id);

    // get ingredient unit
    const magic_word = await getPassword();
    rqGet(API_SOUSCHEF_URL + "ingredient/" + ing_id, {
      magic_word: magic_word,
    })
      .then(ing => { setPIngredientUnit(ing.unit) })
      .catch(err => console.error(err))

    // product list based on the chosen ingredient
    rqGet(API_SOUSCHEF_URL + "product/ingredient/" + ing_id, {
      magic_word: magic_word,
    })
      .then(prds => { setProducts(prds) })
      .catch(err => console.error(err))
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
  const toggleEditor = () => {setEditorVisible(!editorVisible)}
  const toggleEraser = () => {setEraserVisible(!eraserVisible)}
  const openEditor = (product?: Product) => {
    setPId(product?.id ?? 0);
    setPEan(product.ean);
    setPName(product.name);
    setPIngredientId(product.ingredient_id);
    setPAmount(product.amount);
    setPEstExpirationDays(product.est_expiration_days);

    toggleEditor();
  }
  const handleSave = async () => {
    const toastId = toast.show("Zapisuję...");

    const magic_word = await getPassword();
    const editing = (pId != 0);
    const rq = (editing) ? rqPatch : rqPost;
    rq(API_SOUSCHEF_URL + "product" + (editing ? `/${pId}` : ""), {
      magic_word: magic_word,
      ean: pEan,
      name: pName,
      ingredientId: pIngredientId,
      amount: pAmount,
      estExpirationDays: pEstExpirationDays,
    })
      .then(res => {
        toggleEditor();
        toast.update(toastId, "Produkt gotowy", {type: "success"});
        getData(pIngredientId);
      })
      .catch(err => {
        console.error(err)
        toast.update(toastId, `Nie udało się zapisać: ${err.message}`, {type: "danger"})
      })
  }
  const handleDelete = async () => {
    const toastId = toast.show("Zapisuję...");

    const magic_word = await getPassword();
    rqDelete(API_SOUSCHEF_URL + `product/${pId}`, {magic_word: magic_word})
      .then(res => {
        toggleEraser();
        toast.update(toastId, "Produkt usunięty", {type: "success"});
        getData(pIngredientId);
      })
      .catch(err => {
        console.error(err)
        toast.update(toastId, `Nie udało się usunąć: ${err.message}`, {type: "danger"})
      })
  }

  return <View style={s.wrapper}>
    <TopHeader title="Produkty" />

    <View style={[s.margin, s.center]}>
      <SCSelect items={ingredients} label="Wybierz składnik" value={pIngredientId} onChange={getData} />
    </View>

    {/* list */}
    {!pIngredientId
    ? <></>
    : prdLoaderVisible
    ? <Loader />
    : <>
      <FlatList data={products}
      renderItem={({item}) =>
        <PositionTile
          icon={item.ingredient.category.symbol}
          title={item.name}
          buttons={<>
            <SCButton icon="wrench" color="lightgray" title="Edytuj" onPress={() => openEditor(item)} />
          </>}
        />
      }
      ItemSeparatorComponent={() => <HorizontalLine />}
      ListEmptyComponent={<BarText color="lightgray">Brak produktów</BarText>}
      />
    </>
    }

    {/* editor */}
    <SCModal
      title={`${(pId != 0) ? "Edytuj" : "Dodaj"} produkt`}
      visible={editorVisible}
      onRequestClose={toggleEditor}
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
        {pId != 0 && <SCButton icon="trash" color="red" title="Usuń" onPress={() => {toggleEditor(); toggleEraser();}} />}
      </View>
    </SCModal>

    {/* eraser */}
    <SCModal
      title="Usuń produkt"
      visible={eraserVisible}
      onRequestClose={toggleEraser}
      >
      <Text>Czy na pewno chcesz usunąć produkt {pName}?</Text>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="fire-alt" title="Tak" color="red" onPress={handleDelete} />
      </View>
    </SCModal>
  </View>
}
