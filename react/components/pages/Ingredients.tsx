import { FlatList, RefreshControl, Text, View } from "react-native"
import s from "../../assets/style"
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import PositionTile from "../PositionTile";
import { rqDelete, rqGet, rqPatch, rqPost } from "../../helpers/SCFetch";
import { Ingredient, SelectItem } from "../../types";
import HorizontalLine from "../HorizontalLine";
import { SCButton, SCInput, SCModal, SCSelect } from "../SCSpecifics";
import { prepareSelectItems } from "../../helpers/Prepare";
import { useToast } from "react-native-toast-notifications";
import { FG_COLOR, LIGHT_COLOR } from "../../assets/constants";
import Header from "../Header";

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

    rqGet("ingredients")
      .then(res => setIngredients(res))
      .catch(err => toast.show("Problem: "+err.message, {type: "danger"}))
      .finally(() => setIngLoaderVisible(false))
    ;
  }

  useEffect(() => {
    setIngLoaderVisible(true);
    if(isFocused) getData();
  }, [isFocused]);

  // modal
  const openEditor = (ingredient?: Ingredient) => {
    rqGet("categories")
      .then(cats => { setCategories(prepareSelectItems(cats, "name", "id", true)) })
      .catch(err => toast.show("Problem: "+err.message, {type: "danger"}))

    setCName(ingredient?.name);
    setCCategoryId(ingredient?.category_id);
    setCFreezable(ingredient?.freezable);
    setCMinimalAmount(ingredient?.minimal_amount);
    setCUnit(ingredient?.unit);
    setCDash(ingredient?.dash);
    setCId(ingredient?.id ?? 0);

    setEditorVisible(true);
  }
  const handleSave = async () => {
    const toastId = toast.show("Zapisuję...");

    const editing = (cId != 0);
    const rq = (editing) ? rqPatch : rqPost;
    rq("ingredients" + (editing ? `/${cId}` : ""), {
      name: cName,
      categoryId: cCategoryId,
      freezable: cFreezable || false,
      minimalAmount: cMinimalAmount,
      unit: cUnit,
      dash: cDash || false,
    }).then(res => {
      toast.update(toastId, "Składnik gotowy", {type: "success"});
    }).catch(err => {
      toast.update(toastId, `Nie udało się zapisać: ${err.message}`, {type: "danger"})
    }).finally(() => {
      setEditorVisible(false)
      getData()
    })
  }
  const handleDelete = async () => {
    const toastId = toast.show("Zapisuję...");

    rqDelete(`ingredients/${cId}`)
      .then(res => {
        toast.update(toastId, "Składnik usunięty", {type: "success"});
      }).catch(err => {
        toast.update(toastId, `Nie udało się usunąć: ${err.message}`, {type: "danger"})
      }).finally(() => {
        setEraserVisible(false)
        setEditorVisible(false)
        getData()
      })
  }

  return <View style={s.wrapper}>
    <Header icon="box" level={1}>Składniki</Header>

    <SCButton icon="plus" title="Dodaj składnik" onPress={() => openEditor()} />

    {/* list */}
    <FlatList data={ingredients}
      refreshControl={<RefreshControl refreshing={ingLoaderVisible} onRefresh={getData} />}
      renderItem={({item}) =>
        <PositionTile
          icon={item.category.symbol}
          title={item.name}
          subtitle={[
            item.unit,
            item.minimal_amount !== null && "min. " + item.minimal_amount,
            item.freezable && "🧊",
            item.dash && "🤏",
          ].filter(Boolean).join(" • ") || undefined}
          buttons={<>
            <SCButton icon="wrench" color={LIGHT_COLOR} onPress={() => openEditor(item)} small />
          </>}
        />
      }
      ItemSeparatorComponent={() => <HorizontalLine />}
      ListEmptyComponent={<Header level={3}>Brak składników</Header>}
      />

    {/* editor */}
    <SCModal
      title={`${(cId != 0) ? "Edytuj" : "Dodaj"} składnik`}
      visible={editorVisible}
      onRequestClose={() => setEditorVisible(false)}
      >
      <View style={[s.margin, s.center]}>
        <SCInput label="Nazwa składnika" value={cName} onChange={setCName} />
        <SCSelect label="Kategoria" value={cCategoryId} items={categories} onChange={setCCategoryId} />
        <SCInput type="checkbox" label="Trzymany w lodówce" value={cFreezable} onChange={setCFreezable} />
        <SCInput label="Jednostka" value={cUnit} onChange={setCUnit} />
        <SCInput type="numeric" label={`Minimalna ilość (${cUnit})`} value={cMinimalAmount} onChange={setCMinimalAmount} />
        <SCInput type="checkbox" label="Powolne zużycie" value={cDash} onChange={setCDash} />
      </View>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="check" title="Zapisz" onPress={handleSave} />
        {cId != 0 && <SCButton icon="trash" color="red" title="Usuń" onPress={() => setEraserVisible(true)} />}
      </View>
    </SCModal>

    {/* eraser */}
    <SCModal
      title="Usuń składnik"
      visible={eraserVisible}
      onRequestClose={() => setEraserVisible(false)}
      >
      <Text style={{color: FG_COLOR}}>Czy na pewno chcesz usunąć składnik {cName}?</Text>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="fire-alt" title="Tak" color="red" onPress={handleDelete} />
      </View>
    </SCModal>
  </View>
}
