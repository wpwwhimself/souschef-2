import { useEffect, useState } from "react";
import { SCButton, SCInput, SCModal } from "./SCSpecifics";
import { Keyboard, SectionList, View } from "react-native";
import Header from "./Header";
import { SelectItem } from "../types";
import HorizontalLine from "./HorizontalLine";
import { rqGet } from "../helpers/SCFetch";
import { useToast } from "react-native-toast-notifications";
import { prepareSelectItems } from "../helpers/Prepare";
import s from "../assets/style"
import { ACCENT_COLOR, LIGHT_COLOR } from "../assets/constants";

interface BSInput{
  ingId?: number,
  onChange: (newValue: any) => any,
  color?: string,
  forceOpen?: boolean,
}
interface ContentEl{
  header: string,
  data: SelectItem[][],
}

export default function IngredientSelector({ingId, onChange, color = ACCENT_COLOR, forceOpen = false}: BSInput){
  const [ingredientName, setIngredientName] = useState("Wybierz składnik")
  const [modalVisible, setModalVisible] = useState(false)
  const [smallLoaderVisible, setSmallLoaderVisible] = useState(true)
  const [content, setContent] = useState<ContentEl[]>()
  const toast = useToast()

  useEffect(() => {
    Keyboard.dismiss()
    setSmallLoaderVisible(true)
    rqGet("ingredients")
      .then(ings => {
        const items = prepareSelectItems(ings, "name", "id")
        const all_letters = items.map((si => si.label.charAt(0).toLocaleLowerCase()))
        const available_letters = all_letters.filter((letter, index) => all_letters.indexOf(letter) === index)

        setContent(available_letters.map(letter => ({
          header: letter,
          data: [items.filter(si => si.label.charAt(0).toLocaleLowerCase() == letter)],
        })))

        if(ingId){
          setIngredientName(items.find(si => si.value == ingId).label)
        }
      }).catch(err => {
        toast.show("Problem: "+err.message, {type: "danger"})
      }).finally(() => {
        setSmallLoaderVisible(false)
        if(forceOpen){
          openModal()
        }
      })
  }, [])

  const openModal = () => {
    setModalVisible(true)
  }
  const closeModal = () => {
    setModalVisible(false)
  }

  const handleSelectIngredient = (ingredient: SelectItem) => {
    setIngredientName(ingredient.label)
    onChange(ingredient.value)
    closeModal()
  }

  return <View style={[s.flexRight, s.center]}>
    <SCButton
      title={ingredientName}
      icon="box"
      color={color}
      onPress={openModal}
    />

    {/* selector */}
    <SCModal
      visible={modalVisible}
      title="Wybierz składnik"
      onRequestClose={closeModal}
      loader={smallLoaderVisible}
    >
      <SectionList
        sections={content}
        renderSectionHeader={({section}) => <Header>{section.header.toLocaleUpperCase()}</Header>}
        renderItem={({item}) => <View style={[s.flexRight]}>
          {item.map((ing, i) =>
            <SCButton key={i}
              title={ing.label}
              onPress={() => handleSelectIngredient(ing)}
              color={LIGHT_COLOR}
            />
          )}
        </View>}
        ItemSeparatorComponent={() => <HorizontalLine />}
        style={{ maxHeight: 600 }}
        stickySectionHeadersEnabled={true}
      />
    </SCModal>
  </View>

}
