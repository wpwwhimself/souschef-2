import { FlatList, RefreshControl, Text, View } from "react-native"
import s from "../../assets/style"
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import PositionTile from "../PositionTile";
import { SCButton, SCModal, SCInput, SCSelect } from "../SCSpecifics";
import { rqDelete, rqGet, rqPatch, rqPost } from "../../helpers/SCFetch";
import { Category, Ingredient } from "../../types";
import HorizontalLine from "../HorizontalLine";
import { useToast } from "react-native-toast-notifications";
import { FG_COLOR, LIGHT_COLOR } from "../../assets/constants";
import Header from "../Header";

export default function Categories({navigation}){
  const isFocused = useIsFocused();
  const [categories, setCategories] = useState([] as Category[]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [eraserVisible, setEraserVisible] = useState(false);
  const [catLoaderVisible, setCatLoaderVisible] = useState(true);
  const toast = useToast();

  const [cId, setCId] = useState(0);
  const [cName, setCName] = useState("");
  const [cSymbol, setCSymbol] = useState("");
  const [cOrdering, setCOrdering] = useState(0);

  const [orphans, setOrphans] = useState<Ingredient[]>()
  const [orphansNewFK, setOrphansNewFK] = useState<number>()

  const getData = async () => {
    setCatLoaderVisible(true);

    rqGet("categories")
      .then(res => setCategories(res))
      .catch(err => toast.show(err.message, {type: "danger"}))
      .finally(() => setCatLoaderVisible(false))
    ;
  }

  useEffect(() => {
    setCatLoaderVisible(true);
    if(isFocused) getData();
  }, [isFocused]);

  // modal
  const openEditor = (category?: Category) => {
    setCName(category?.name);
    setCSymbol(category?.symbol);
    setCOrdering(category?.ordering);
    setCId(category?.id ?? 0);
    setEditorVisible(true);
  }
  const handleSave = async () => {
    const toastId = toast.show("Zapisuję...");

    const editing = (cId != 0);
    const rq = (editing) ? rqPatch : rqPost;
    rq("categories" + (editing ? `/${cId}` : ""), {
      name: cName,
      symbol: cSymbol,
      ordering: cOrdering,
    }).then(res => {
      toast.update(toastId, "Kategoria gotowa", {type: "success"});
    }).catch(err => {
      toast.update(toastId, `Nie udało się zapisać: ${err.message}`, {type: "danger"})
    }).finally(() => {
      setEditorVisible(false)
      getData()
    })
  }
  const prepareDelete = () => {
    rqGet(`ingredients/category/${cId}`)
      .then(res => {
        setOrphans(res)
        setOrphansNewFK(undefined)
      }).catch(err => {
        toast.show(`Problem: ${err.message}`, {type: "danger"})
      })

    setEraserVisible(true)
  }
  const handleDelete = async () => {
    const toastId = toast.show("Zapisuję...");

    rqDelete(`categories/${cId}`, {
      orphansNewFK: orphansNewFK,
    }).then(res => {
        toast.update(toastId, "Kategoria usunięta", {type: "success"});
      }).catch(err => {
        toast.update(toastId, `Nie udało się usunąć: ${err.message}`, {type: "danger"})
      }).finally(() => {
        setEditorVisible(false)
        setEraserVisible(false)
        setOrphans(undefined)
        setOrphansNewFK(undefined)
        getData()
      })
  }

  return <View style={s.wrapper}>
    <Header icon="boxes" level={1}>Kategorie</Header>
    <SCButton icon="plus" title="Dodaj kategorię" onPress={() => openEditor()} />

    {/* list */}
    <FlatList data={categories}
      refreshControl={<RefreshControl refreshing={catLoaderVisible} onRefresh={getData} />}
      renderItem={({item}) =>
        <PositionTile
          icon={item.symbol}
          title={item.name}
          subtitle={`${item.ingredients_count} skł.`}
          buttons={<>
            <SCButton icon="wrench" color={LIGHT_COLOR} onPress={() => openEditor(item)} small />
          </>}
        />
      }
      ItemSeparatorComponent={() => <HorizontalLine />}
      ListEmptyComponent={<Header level={3}>Brak kategorii</Header>}
      />

    {/* editor */}
    <SCModal
      title={`${(cId != 0) ? "Edytuj" : "Dodaj"} kategorię`}
      visible={editorVisible}
      onRequestClose={() => setEditorVisible(false)}
      >
      <View style={[s.margin, s.center]}>
        <SCInput label="Nazwa kategorii" value={cName} onChange={setCName} />
        <SCInput label="Emotka" value={cSymbol} onChange={setCSymbol} />
        <SCInput label="Kolejność na liście" value={cOrdering} onChange={setCOrdering} />
      </View>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="check" title="Zapisz" onPress={handleSave} />
        {cId != 0 && <SCButton icon="trash" color="red" title="Usuń" onPress={prepareDelete} />}
      </View>
    </SCModal>

    {/* eraser */}
    <SCModal
      title="Usuń kategorię"
      visible={eraserVisible}
      onRequestClose={() => setEraserVisible(false)}
      >
      <Text style={{color: FG_COLOR}}>Czy na pewno chcesz usunąć kategorię {cName}?</Text>
      {orphans?.length && <>
        <Text style={{color: FG_COLOR}}>Należy zmienić kategorię dla {orphans.length} składników:</Text>
        <SCSelect items={categories}
          label="Nowa kategoria"
          value={orphansNewFK}
          onChange={setOrphansNewFK}
        />
      </>}
      <View style={[s.flexRight, s.center]}>
        {(!orphans?.length || orphansNewFK) && <SCButton icon="fire-alt" title="Tak" color="red" onPress={handleDelete} />}
      </View>
    </SCModal>
  </View>
}
