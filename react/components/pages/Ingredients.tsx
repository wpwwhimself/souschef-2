import { FlatList, Text, View } from "react-native"
import s from "../../assets/style"
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { getPassword } from "../../helpers/Storage";
import { API_SOUSCHEF_URL } from "../../assets/constants";
import PositionTile from "../PositionTile";
import BarText from "../BarText";
import { rqDelete, rqGet, rqPatch, rqPost } from "../../helpers/SCFetch";
import { Ingredient, SelectItem } from "../../types";
import HorizontalLine from "../HorizontalLine";
import Loader from "../Loader";
import { SCButton, SCInput, SCModal, SCSelect } from "../SCSpecifics";
import { prepareSelectItems } from "../../helpers/Prepare";
import TopHeader from "../TopHeader";
import { useToast } from "react-native-toast-notifications";

export default function Ingredients({navigation}){
  const isFocused = useIsFocused();
  const [ingredients, setIngredients] = useState([] as Ingredient[]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [eraserVisible, setEraserVisible] = useState(false);
  const [ingLoaderVisible, setIngLoaderVisible] = useState(true);
  const [categories, setCategories] = useState([] as SelectItem[])
  const toast = useToast();

  const [cId, setCId] = useState(0);
  const [cName, setCName] = useState("");
  const [cCategoryId, setCCategoryId] = useState(0);
  const [cFreezable, setCFreezable] = useState(false);
  const [cMinimalAmount, setCMinimalAmount] = useState<number>(undefined);
  const [cUnit, setCUnit] = useState("");
  const [cDash, setCDash] = useState(false);

  const getData = async () => {
    setIngLoaderVisible(true);

    const magic_word = await getPassword();
    rqGet(API_SOUSCHEF_URL + "ingredient", {
      magic_word: magic_word,
    })
      .then(res => setIngredients(res))
      .catch(err => console.error(err))
      .finally(() => setIngLoaderVisible(false))
    ;
  }

  useEffect(() => {
    setIngLoaderVisible(true);
    if(isFocused) getData();
  }, [isFocused]);

  // modal
  const toggleEditor = async () => {
    setEditorVisible(!editorVisible)

    const magic_word = await getPassword();
    rqGet(API_SOUSCHEF_URL + "category", {
      magic_word: magic_word,
    })
      .then(cats => { setCategories(prepareSelectItems(cats, "name", "id", true)) })
      .catch(err => console.error(err))
    ;
  }
  const toggleEraser = () => {setEraserVisible(!eraserVisible)}
  const openEditor = (ingredient?: Ingredient) => {
    setCName(ingredient?.name);
    setCCategoryId(ingredient?.category_id);
    setCFreezable(ingredient?.freezable);
    setCMinimalAmount(ingredient?.minimal_amount);
    setCUnit(ingredient?.unit);
    setCDash(ingredient?.dash);
    setCId(ingredient?.id ?? 0);
    toggleEditor();
  }
  const handleSave = async () => {
    const toastId = toast.show("Zapisuję...");

    const magic_word = await getPassword();
    const editing = (cId != 0);
    const rq = (editing) ? rqPatch : rqPost;
    rq(API_SOUSCHEF_URL + "ingredient" + (editing ? `/${cId}` : ""), {
      magic_word: magic_word,
      name: cName,
      categoryId: cCategoryId,
      freezable: cFreezable || false,
      minimalAmount: cMinimalAmount,
      unit: cUnit,
      dash: cDash || false,
    })
      .then(res => {
        toggleEditor();
        toast.update(toastId, "Składnik gotowy", {type: "success"});
        getData();
      })
      .catch(err => {
        console.error(err)
        toast.update(toastId, `Nie udało się zapisać: ${err.message}`, {type: "danger"})
      })
  }
  const handleDelete = async () => {
    const toastId = toast.show("Zapisuję...");

    const magic_word = await getPassword();
    rqDelete(API_SOUSCHEF_URL + `ingredient/${cId}`, {magic_word: magic_word})
      .then(res => {
        toggleEraser();
        toast.update(toastId, "Składnik usunięty", {type: "success"});
        getData();
      })
      .catch(err => {
        console.error(err)
        toast.update(toastId, `Nie udało się usunąć: ${err.message}`, {type: "danger"})
      })
  }

  return <View style={s.wrapper}>
    <TopHeader title="Składniki" subtitle="Co możemy mieć w kuchni" />

    <SCButton icon="plus" title="Dodaj składnik" onPress={() => openEditor()} />

    {/* list */}
    {ingLoaderVisible
    ? <Loader />
    : <FlatList data={ingredients}
      renderItem={({item}) =>
        <PositionTile
          icon={item.category.symbol}
          title={item.name}
          subtitle={[
            item.unit,
            item.minimal_amount && "min. " + item.minimal_amount,
            item.freezable && "🧊",
            item.dash && "🤏",
          ].filter(Boolean).join(" • ") || undefined}
          buttons={<>
            <SCButton icon="wrench" color="lightgray" title="Edytuj" onPress={() => openEditor(item)} />
          </>}
        />
      }
      ItemSeparatorComponent={() => <HorizontalLine />}
      ListEmptyComponent={<BarText color="lightgray">Brak składników</BarText>}
      />
    }

    {/* editor */}
    <SCModal
      title={`${(cId != 0) ? "Edytuj" : "Dodaj"} składnik`}
      visible={editorVisible}
      onRequestClose={toggleEditor}
      >
      <View style={[s.margin, s.center]}>
        <SCInput label="Nazwa składnika" value={cName} onChange={setCName} />
        <SCSelect label="Kategoria" value={cCategoryId} items={categories} onChange={setCCategoryId} />
        <SCInput type="checkbox" label="Trzymany w lodówce" value={!!cFreezable} onChange={setCFreezable} />
        <SCInput label="Jednostka" value={cUnit} onChange={setCUnit} />
        <SCInput type="numeric" label={`Minimalna ilość (${cUnit})`} value={cMinimalAmount} onChange={setCMinimalAmount} />
        <SCInput type="checkbox" label="Powolne zużycie" value={!!cDash} onChange={setCDash} />
      </View>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="check" title="Zapisz" onPress={handleSave} />
        {cId != 0 && <SCButton icon="trash" color="red" title="Usuń" onPress={() => {toggleEditor(); toggleEraser();}} />}
      </View>
    </SCModal>

    {/* eraser */}
    <SCModal
      title="Usuń składnik"
      visible={eraserVisible}
      onRequestClose={toggleEraser}
      >
      <Text>Czy na pewno chcesz usunąć składkik {cName}?</Text>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="fire-alt" title="Tak" color="red" onPress={handleDelete} />
      </View>
    </SCModal>
  </View>
}
