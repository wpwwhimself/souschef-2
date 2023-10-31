import { FlatList, Text, View } from "react-native"
import Header from "../Header"
import s from "../../assets/style"
import { useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import PositionTile from "../PositionTile";
import BarText from "../BarText";
import { rqDelete, rqGet, rqPatch, rqPost } from "../../helpers/SCFetch";
import { SCButton, SCInput, SCModal } from "../SCSpecifics";
import Loader from "../Loader";
import { useToast } from "react-native-toast-notifications";
import { Recipe, RecipeIngredient } from "../../types";
import HorizontalLine from "../HorizontalLine";

export default function Recipes({navigation}){
  const isFocused = useIsFocused();
  const [recipes, setRecipes] = useState([]);
  const [loaderVisible, setLoaderVisible] = useState(false)
  const [smallLoaderVisible, setSmallLoaderVisible] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [editorVisible, setEditorVisible] = useState(false)
  const [eraserVisible, setEraserVisible] = useState(false)
  const [editPreview, setEditPreview] = useState(false)
  const toast = useToast();

  // recipe header params
  const [rId, setRId] = useState<number>()
  const [rName, setRName] = useState<string>()
  const [rSubtitle, setRSubtitle] = useState<string>()
  const [rInstructions, setRInstructions] = useState<string>()
  const [rForDinner, setRForDinner] = useState<boolean>()
  const [rForSupper, setRForSupper] = useState<boolean>()
  const [rIngredients, setRIngredients] = useState<RecipeIngredient[]>()

  const getData = () => {
    setLoaderVisible(true)
    rqGet("recipes")
      .then(res => setRecipes(res))
      .catch(err => toast.show(err.message, {type: "danger"}))
      .finally(() => setLoaderVisible(false))
    ;
  }

  const showPreview = (recipe: Recipe) => {
    setRName(recipe.name)
    setPreviewVisible(true)
  }

  const showEditor = (recipe?: Recipe) => {
    setRId(recipe?.id)
    setRName(recipe?.name)
    setRSubtitle(recipe?.subtitle)
    setRForDinner(recipe?.for_dinner)
    setRForSupper(recipe?.for_supper)
    setEditorVisible(true)
  }

  const handleSave = () => {
    const toastId = toast.show("Zapisuję...");
    const rq = rId ? rqPatch : rqPost;
    rq(`recipes/${rId || ""}`, {
      name: rName,
      subtitle: rSubtitle,
      forDinner: rForDinner || false,
      forSupper: rForSupper || false,
    }).then(res => {
      toast.update(toastId, "Przepis gotowy", {type: "success"})
    }).catch(err => {
      toast.update(toastId, "Problem: " + err.message, {type: "danger"})
    }).finally(() => {
      setEditorVisible(false)
      getData()
    })
  }

  const handleDelete = () => {
    const toastId = toast.show("Usuwam...");
    rqDelete(`recipes/${rId}`)
      .then(res => {
        toast.update(toastId, "Przepis usunięty", {type: "success"})
      }).catch(err => {
        toast.update(toastId, "Problem: " + err.message, {type: "danger"})
      }).finally(() => {
        setEditorVisible(false)
        getData()
      })
  }

  const handleSaveIngredients = () => {

  }

  const handleDeleteIngredients = () => {

  }

  useEffect(() => {
    if(isFocused) getData();
  }, [isFocused]);

  return <View style={s.wrapper}>
    <Header icon="lightbulb">Propozycje</Header>

    <Header icon="list">Lista</Header>
    <SCButton icon="plus" title="Dodaj nowy" onPress={() => showEditor()} />
    <View style={{ flex: 1 }}>
      {loaderVisible
      ? <Loader />
      : <FlatList data={recipes}
        renderItem={({item}: {item: Recipe}) => <PositionTile
            title={item.name}
            subtitle={item.subtitle}
            icon={
              item.for_dinner && item.for_supper ? "🟢"
              : item.for_dinner ? "🌞"
              : item.for_supper ? "🌙"
              : "🍰"
            }
            buttons={<>
              <SCButton onPress={() => showPreview(item)} small />
              <SCButton icon="wrench" color="lightgray" onPress={() => showEditor(item)} small />
            </>}
          />
        }
        ItemSeparatorComponent={() => <HorizontalLine />}
        ListEmptyComponent={<BarText color="lightgray">Brak przepisów</BarText>}
        />
      }
    </View>

    {/* preview */}
    <SCModal
      visible={previewVisible} loader={smallLoaderVisible}
      onRequestClose={() => {setPreviewVisible(false); setEditPreview(false)}}
      title={rName}
      >
      {editPreview
      ? <>
        <SCInput type="TEXT" label="Przepis" value={rInstructions} onChange={setRInstructions} />
      </>
      : <>
        <Header icon="box-open">Składniki</Header>
        <FlatList data={rIngredients}
          renderItem={({item}) =>
            <PositionTile
              title={item.ingredient.name}
              subtitle={`${item.amount} ${item.ingredient.unit}`}
              />}
          />

        <Header icon="scroll">Przepis</Header>
        <Text>{rInstructions || "brak treści przepisu"}</Text>
      </>}
      <View style={[s.flexRight, s.center]}>
        {editPreview
        ? <>
          <SCButton icon="check" title="Zapisz" onPress={handleSaveIngredients} />
          <SCButton icon="trash" title="Usuń" onPress={handleDeleteIngredients} />
        </>
        : <SCButton icon={"pen"} title={"Edytuj"} onPress={() => setEditPreview(!editPreview)} />
        }
      </View>
    </SCModal>

    {/* editor */}
    <SCModal
      visible={editorVisible} loader={smallLoaderVisible}
      onRequestClose={() => setEditorVisible(false)}
      title={`${rId ? 'Edytuj' : 'Dodaj'} przepis`}
      >
      <View style={[s.margin, s.center]}>
        <SCInput label="Nazwa" value={rName} onChange={setRName} />
        <SCInput label="Podtytuł" value={rSubtitle} onChange={setRSubtitle} />
        <View style={[s.flexRight, s.center]}>
          <Text>Danie na:</Text>
          <SCInput type="checkbox" label="obiad" value={rForDinner} onChange={setRForDinner} />
          <SCInput type="checkbox" label="kolację" value={rForSupper} onChange={setRForSupper} />
        </View>
      </View>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="check" title="Zapisz" onPress={handleSave} />
        {rId && <SCButton icon="trash" color="red" title="Usuń" onPress={() => {showEditor(); setEraserVisible(true);}} />}
      </View>
    </SCModal>

    {/* eraser */}
    <SCModal
      title="Usuń składnik"
      visible={eraserVisible}
      onRequestClose={() => setEraserVisible(false)}
      >
      <Text>Czy na pewno chcesz usunąć przepis {rName}?</Text>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="fire-alt" title="Tak" color="red" onPress={handleDelete} />
      </View>
    </SCModal>
  </View>
}
