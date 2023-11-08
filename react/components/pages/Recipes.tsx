import { FlatList, RefreshControl, Text, View } from "react-native"
import Header from "../Header"
import s from "../../assets/style"
import { useState, useEffect } from "react";
import { useIsFocused, useRoute } from "@react-navigation/native";
import PositionTile from "../PositionTile";
import BarText from "../BarText";
import { rqDelete, rqGet, rqPatch, rqPost } from "../../helpers/SCFetch";
import { SCButton, SCInput, SCModal, SCSelect } from "../SCSpecifics";
import Loader from "../Loader";
import { useToast } from "react-native-toast-notifications";
import { Ingredient, Recipe, RecipeIngredient, SelectItem } from "../../types";
import HorizontalLine from "../HorizontalLine";
import { prepareSelectItems } from "../../helpers/Prepare";
import { ACCENT_COLOR } from "../../assets/constants";
import AmountIndicator from "../AmountIndicator";
import TitledText from "../TitledText";

export default function Recipes({navigation}){
  const isFocused = useIsFocused();
  const [recipes, setRecipes] = useState<Recipe[]>();
  const [loaderVisible, setLoaderVisible] = useState(true)
  const [suggestionsLoaderVisible, setSuggestionsLoaderVisible] = useState(false)
  const [smallLoaderVisible, setSmallLoaderVisible] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [editorVisible, setEditorVisible] = useState(false)
  const [dangerModalMode, setDangerModalMode] = useState<false | "recipe" | "ingredient">(false)
  const [recipeIngredientModVisible, setRecipeIngredientModVisible] = useState(false)
  const [editPreview, setEditPreview] = useState(false)
  const toast = useToast();
  const route = useRoute();

  const [ingredients, setIngredients] = useState<SelectItem[]>()
  const [suggestions, setSuggestions] = useState<{for_dinner: Recipe, for_supper: Recipe}>()

  // recipe header params
  const [rId, setRId] = useState<number>()
  const [rName, setRName] = useState<string>()
  const [rSubtitle, setRSubtitle] = useState<string>()
  const [rInstructions, setRInstructions] = useState<string>()
  const [rForDinner, setRForDinner] = useState<boolean>()
  const [rForSupper, setRForSupper] = useState<boolean>()
  const [rIngredients, setRIngredients] = useState<RecipeIngredient[]>()

  // recipe ingredient params
  const [riId, setRiId] = useState<number>()
  const [riIngredientId, setRiIngredientId] = useState<number>()
  const [iUnit, setIUnit] = useState<string>()
  const [riAmount, setRiAmount] = useState<number>()
  const [riOptional, setRiOptional] = useState<boolean>()

  const getData = () => {
    setLoaderVisible(true)
    rqGet("recipes")
      .then(res => setRecipes(res))
      .catch(err => toast.show(err.message, {type: "danger"}))
      .finally(() => setLoaderVisible(false))
    ;
  }

  const getSuggestions = () => {
    setSuggestionsLoaderVisible(true)
    rqGet("recipes/actions/suggestions")
      .then(rcps => setSuggestions(rcps))
      .catch(err => {
        toast.show("Problem z wczytaniem sugestii: "+err.message, {type: "danger"})
      }).finally(() => {
        setSuggestionsLoaderVisible(false)
      })
  }
  const sgsLabels = {
    for_dinner: "Na obiad 🌞",
    for_supper: "Na kolację 🌙",
  }

  const setRecipeParams = (recipe: Recipe) => {
    setRId(recipe?.id)
    setRName(recipe?.name)
    setRSubtitle(recipe?.subtitle)
    setRForDinner(recipe?.for_dinner)
    setRForSupper(recipe?.for_supper)
    setRInstructions(recipe?.instructions)
    setRIngredients(recipe?.ingredients)
  }

  const showPreview = (recipe: Recipe) => {
    setRecipeParams(recipe)
    setPreviewVisible(true)
  }

  const showHeaderEditor = (recipe?: Recipe) => {
    setRecipeParams(recipe)
    setEditorVisible(true)
  }

  const enablePreviewEdit = () => {
    setSmallLoaderVisible(true)
    rqGet("ingredients")
      .then((ings: Ingredient[]) => {
        setIngredients(prepareSelectItems(ings, "name", "id", true))
      }).catch(err => {
        toast.show("Nie udało się pobrać składników: "+err.message, {type: "danger"})
      }).finally(() => {
        setSmallLoaderVisible(false)
        setEditPreview(true)
      })
  }

  const handleSetRiIngredientId = (ing_id: number) => {
    setRiIngredientId(ing_id)
    rqGet(`ingredients/${ing_id}`)
      .then((ing: Ingredient) => {
        setIUnit(ing.unit)
      }).catch(err => {
        toast.show("Nie udało się pobrać jednostki: "+err.message, {type: "danger"})
      })
  }

  const handleEditIngredient = (recipeIngredient?: RecipeIngredient) => {
    setRiId(recipeIngredient?.id)
    setRiIngredientId(recipeIngredient?.ingredient_id)
    setRiAmount(recipeIngredient?.amount)
    setRiOptional(recipeIngredient?.optional)
    setRecipeIngredientModVisible(true)
  }
  const closeEditIngredient = () => {
    setRiId(undefined)
    setRiIngredientId(undefined)
    setRiAmount(undefined)
    setRiOptional(undefined)
    setRecipeIngredientModVisible(false)
  }

  const handleSave = () => {
    const toastId = toast.show("Zapisuję...");
    const rq = rId ? rqPatch : rqPost;
    rq("recipes" + (rId ? `/${rId}` : ""), {
      name: rName,
      subtitle: rSubtitle,
      forDinner: rForDinner || false,
      forSupper: rForSupper || false,
      instructions: rInstructions,
    }).then(res => {
      toast.update(toastId, "Przepis gotowy", {type: "success"})
    }).catch(err => {
      toast.update(toastId, "Problem: " + err.message, {type: "danger"})
    }).finally(() => {
      setEditorVisible(false)
      setPreviewVisible(false); setEditPreview(false);
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
        setDangerModalMode(false)
        setEditorVisible(false)
        getData()
      })
  }

  const handleSaveIngredients = () => {
    const toastId = toast.show("Zapisuję...")
    const rq = riId ? rqPatch : rqPost
    rq("recipe-ingredients" + (riId ? `/${riId}` : ""), {
      recipeId: rId,
      ingredientId: riIngredientId,
      amount: riAmount,
      optional: riOptional || false,
    }).then(res => {
      toast.update(toastId, "Składnik gotowy", {type: "success"})
    }).then(() =>
      rqGet(`recipes/${rId}`)
    ).then(recipe => {
      setRecipeParams(recipe)
    }).catch(err => {
      toast.update(toastId, "Problem: "+err.message, {type: "danger"})
    }).finally(() => {
      closeEditIngredient()
      getData()
    })
  }

  const handleDeleteIngredient = () => {
    const toastId = toast.show("Usuwam...")
    rqDelete(`recipe-ingredients/${riId}`)
      .then(res => {
        toast.update(toastId, "Składnik usunięty", {type: "success"})
      }).then(() =>
        rqGet(`recipes/${rId}`)
      ).then(recipe => {
        setRecipeParams(recipe)
      }).catch(err => {
        toast.update(toastId, "Problem: " + err.message, {type: "danger"})
      }).finally(() => {
        setDangerModalMode(false)
        setRecipeIngredientModVisible(false)
        getData()
      })
  }

  const goToCookingMode = () => {
    const toastId = toast.show("Przygotowuję listę...")
    rqPost(`cooking-products/actions/add-from-recipe/${rId}`)
      .then(res => {
        toast.update(toastId, "Lista gotowa", {type: "success"})
        setPreviewVisible(false)
        navigation.navigate("CookingMode")
      }).catch(err => {
        toast.update(toastId, "Problem: "+err.message, {type: "danger"})
      })
  }

  const dangerModes = {
    recipe: {
      title: "Usuń przepis",
      text: `Czy na pewno chcesz usunąć przepis na ${rName}?`,
      confirm: handleDelete,
    },
    ingredient: {
      title: "Usunięcie składnika z przepisu",
      text: `Czy na pewno chcesz usunąć ten składnik z przepisu?`,
      confirm: handleDeleteIngredient,
    },
  }

  useEffect(() => {
    if(isFocused){
      getData()
      getSuggestions()
    }
  }, [isFocused]);

  return <View style={s.wrapper}>
    <Header icon="lightbulb">Propozycje</Header>
    <SCButton icon="dice" color="lightgray" title="Losuj propozycje" onPress={getSuggestions} />
    {suggestionsLoaderVisible
    ? <Loader />
    : <View style={[s.flexRight]}>
      {suggestions && Object.keys(suggestions).map((key) =>
        <View key={key} style={[s.flexRight, s.center, { flexGrow: 1 }]}>
        <TitledText title={sgsLabels[key]}>
          {suggestions[key]?.name || "nie mam propozycji..."}
        </TitledText>
        {suggestions[key] && <SCButton onPress={() => showPreview(suggestions[key])} />}
      </View>)}
    </View>}

    <Header icon="list">Lista</Header>
    <SCButton icon="plus" title="Dodaj przepis" onPress={() => showHeaderEditor()} />
    <View style={{ flex: 1 }}>
      <FlatList data={recipes}
        refreshControl={<RefreshControl refreshing={loaderVisible} onRefresh={getData} />}
        renderItem={({item}) => <PositionTile
            title={item.name}
            subtitle={item.subtitle}
            icon={
              item.for_dinner && item.for_supper ? "🟢"
              : item.for_dinner ? "🌞"
              : item.for_supper ? "🌙"
              : "🍰"
            }
            buttons={<>
              <AmountIndicator
                amount={item.ingredients.length - item.stock_insufficient_count}
                unit="skł."
                maxAmount={item.ingredients.length}
                amountAsFraction
                highlightAt={1}
                />
              <SCButton onPress={() => showPreview(item)} small />
              <SCButton icon="wrench" color="lightgray" onPress={() => showHeaderEditor(item)} small />
            </>}
          />
        }
        ItemSeparatorComponent={() => <HorizontalLine />}
        ListEmptyComponent={<BarText color="lightgray" small>Brak przepisów</BarText>}
        />
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

        <Header icon="box-open">Składniki</Header>
        <FlatList data={rIngredients}
          renderItem={({item}) =>
            <PositionTile
              title={item.ingredient.name}
              subtitle={[
                `${item.amount} ${item.ingredient.unit}`,
                item.optional ? "➕" : undefined,
              ].filter(Boolean).join(" • ")}
              icon={item.ingredient.category.symbol}
              buttons={<>
                <SCButton icon="wrench" color="lightgray" onPress={() => handleEditIngredient(item)} small />
              </>}
              />}
          ItemSeparatorComponent={() => <HorizontalLine />}
          ListEmptyComponent={<BarText color="lightgray" small>Brak składników</BarText>}
          style={s.popUpList}
          />
        <View style={[s.flexRight, s.center]}>
          <SCButton icon="plus" title="Dodaj składnik" onPress={() => handleEditIngredient()} small />
          <SCButton icon="check" title="Zapisz" onPress={handleSave} />
        </View>
      </>
      : <>
        <Header icon="box-open">Składniki</Header>
        <FlatList data={rIngredients}
          renderItem={({item}) =>
            <PositionTile
              title={item.ingredient.name}
              subtitle={[
                `${item.amount} ${item.ingredient.unit}`,
                item.optional ? "➕" : undefined,
              ].filter(Boolean).join(" • ")}
              icon={item.ingredient.category.symbol}
              buttons={item.stock_amount < item.amount && !item.optional && <Text style={{ color: ACCENT_COLOR }}>Za mało na stanie</Text>}
              />}
          ItemSeparatorComponent={() => <HorizontalLine />}
          ListEmptyComponent={<BarText color="lightgray" small>Brak składników</BarText>}
          style={s.popUpList}
          />

        <Header icon="scroll">Przepis</Header>
        {rInstructions ? <Text>{rInstructions}</Text> : <BarText color="lightgray" small>Brak treści przepisu</BarText>}
        <View style={[s.flexRight, s.center]}>
          <SCButton icon="pen" color="lightgray" title="Edytuj" onPress={enablePreviewEdit} />
          <SCButton title="Podlicz" onPress={goToCookingMode} />
        </View>
      </>}
    </SCModal>

    {/* header editor */}
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
        {rId && <SCButton icon="trash" color="red" title="Usuń" onPress={() => {setDangerModalMode("recipe");}} />}
      </View>
    </SCModal>

    {/* details editor */}
    <SCModal
      visible={recipeIngredientModVisible}
      onRequestClose={() => setRecipeIngredientModVisible(false)}
      title="Składnik"
      >
      <View style={[s.margin, s.center]}>
        <SCSelect items={ingredients} label="Składnik" value={riIngredientId} onChange={handleSetRiIngredientId} />
        <SCInput type="numeric" label={"Ilość" + (iUnit ? ` (${iUnit})` : "")} value={riAmount} onChange={setRiAmount} />
        <SCInput type="checkbox" label="Opcjonalny" value={riOptional} onChange={setRiOptional} />
      </View>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="check" title="Zatwierdź" onPress={handleSaveIngredients} />
        {riId && <SCButton icon="trash" color="red" title="Usuń" onPress={() => {setDangerModalMode("ingredient")}} />}
      </View>
    </SCModal>

    {/* danger modal */}
    <SCModal
      title={dangerModalMode && dangerModes[dangerModalMode].title}
      visible={dangerModalMode}
      onRequestClose={() => setDangerModalMode(false)}
      >
      <Text>{dangerModalMode && dangerModes[dangerModalMode ?? ""].text}</Text>
      <View style={[s.flexRight, s.center]}>
        <SCButton icon="fire-alt" title="Tak" color="red" onPress={dangerModalMode && dangerModes[dangerModalMode ?? ""].confirm} />
      </View>
    </SCModal>
  </View>
}
