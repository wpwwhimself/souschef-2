import { FlatList, Text, View } from "react-native"
import s from "../../assets/style"
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { getPassword } from "../../helpers/Storage";
import { API_SOUSCHEF_URL } from "../../assets/constants";
import PositionTile from "../PositionTile";
import BarText from "../BarText";
import { SCButton, SCModal, SCInput } from "../SCSpecifics";
import { rqDelete, rqGet, rqPatch, rqPost } from "../../helpers/SCFetch";
import { Category } from "../../types";
import HorizontalLine from "../HorizontalLine";
import Loader from "../Loader";
import TopHeader from "../TopHeader";
import { useToast } from "react-native-toast-notifications";

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

  const getData = async () => {
    setCatLoaderVisible(true);

    const magic_word = await getPassword();
    rqGet(API_SOUSCHEF_URL + "category", {
      magic_word: magic_word,
    })
      .then(res => setCategories(res))
      .catch(err => console.error(err))
      .finally(() => setCatLoaderVisible(false))
    ;
  }

  useEffect(() => {
    setCatLoaderVisible(true);
    if(isFocused) getData();
  }, [isFocused]);

  // modal
  const toggleEditor = () => {setEditorVisible(!editorVisible)}
  const toggleEraser = () => {setEraserVisible(!eraserVisible)}
  const openEditor = (category?: Category) => {
    setCName(category?.name);
    setCSymbol(category?.symbol);
    setCId(category?.id ?? 0);
    toggleEditor();
  }
  const handleSave = async () => {
    const toastId = toast.show("Zapisuję...");

    const magic_word = await getPassword();
    const editing = (cId != 0);
    const rq = (editing) ? rqPatch : rqPost;
    rq(API_SOUSCHEF_URL + "category" + (editing ? `/${cId}` : ""), {
      magic_word: magic_word,
      name: cName,
      symbol: cSymbol,
    })
      .then(res => {
        toggleEditor();
        toast.update(toastId, "Kategoria gotowa", {type: "success"});
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
    rqDelete(API_SOUSCHEF_URL + `category/${cId}`, {magic_word: magic_word})
      .then(res => {
        toggleEraser();
        toast.update(toastId, "Kategoria usunięta", {type: "success"});
        getData();
      })
      .catch(err => {
        console.error(err)
        toast.update(toastId, `Nie udało się usunąć: ${err.message}`, {type: "danger"})
      })
  }

  return <View style={s.wrapper}>
    <TopHeader title="Kategorie" subtitle="Lista dostępnych kategorii produktów" />

    <SCButton icon="plus" title="Dodaj kategorię" onPress={() => openEditor()} />

    {/* list */}
    {catLoaderVisible
    ? <Loader />
    : <FlatList data={categories}
      renderItem={({item}) =>
        <PositionTile
          icon={item.symbol}
          title={item.name}
          buttons={<>
            <SCButton icon="wrench" color="lightgray" onPress={() => openEditor(item)} small />
          </>}
        />
      }
      ItemSeparatorComponent={() => <HorizontalLine />}
      ListEmptyComponent={<BarText color="lightgray">Brak kategorii</BarText>}
      />
    }

    {/* editor */}
    <SCModal
      title={`${(cId != 0) ? "Edytuj" : "Dodaj"} kategorię`}
      visible={editorVisible}
      onRequestClose={toggleEditor}
      >
      <View style={[s.margin, s.center]}>
        <SCInput label="Nazwa kategorii" value={cName} onChange={setCName} />
        <SCInput label="Emotka" value={cSymbol} onChange={setCSymbol} />
      </View>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="check" title="Zapisz" onPress={handleSave} />
        {cId != 0 && <SCButton icon="trash" color="red" title="Usuń" onPress={() => {toggleEditor(); toggleEraser();}} />}
      </View>
    </SCModal>

    {/* eraser */}
    <SCModal
      title="Usuń kategorię"
      visible={eraserVisible}
      onRequestClose={toggleEraser}
      >
      <Text>Czy na pewno chcesz usunąć kategorię {cName}?</Text>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="fire-alt" title="Tak" color="red" onPress={handleDelete} />
      </View>
    </SCModal>
  </View>
}
