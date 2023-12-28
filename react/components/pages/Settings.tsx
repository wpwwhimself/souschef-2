import { SectionList, View } from "react-native"
import Header from "../Header"
import s from "../../assets/style"
import { useState, useEffect } from "react"
import { getKey, setKey } from "../../helpers/Storage";
import { SCButton, SCInput, SCRadio } from "../SCSpecifics";
import { useToast } from "react-native-toast-notifications";
import { useIsFocused } from "@react-navigation/native";
import { SelectItem } from "../../types";

export default function Settings(){
  const toast = useToast();
  const isFocused = useIsFocused();

  const [dbUrl, setDbUrl] = useState("");
  const [dbPassword, setDbPassword] = useState("");
  const [eanUrl, setEanUrl] = useState("");
  const [eanToken, setEanToken] = useState("");

  const [suggestOnlyStockedRecipes, setSuggestOnlyStockedRecipes] = useState(false)
  const [editAmountAfterCookingProductBound, setEditAmountAfterCookingProductBound] = useState<0 | 1 | 2>(0)
  const editAmountAfterCookingProductBoundValues: SelectItem[] = [
    { value: 2, label: "Tak" },
    { value: 1, label: "Tylko dla powolnego zużycia" },
    { value: 0, label: "Nie" },
  ]

  const storage = {
    dbUrl: setDbUrl,
    magicWord: setDbPassword,
    eanUrl: setEanUrl,
    EANToken: setEanToken,
    editAmountAfterCookingProductBound: setEditAmountAfterCookingProductBound,
  }

  useEffect(() => {
    if(!isFocused) return;

    // load data from storage
    Object.keys(storage).forEach(key => {
      getKey(key).then(res => storage[key](res)).catch(err => toast.show(err.message, {type: "danger"}));
    });
  }, [isFocused]);

  const handleSave = () => {
    setKey("dbUrl", dbUrl);
    setKey("magicWord", dbPassword);
    setKey("eanUrl", eanUrl);
    setKey("EANToken", eanToken);

    setKey("suggestOnlyStockedRecipes", suggestOnlyStockedRecipes);
    setKey("editAmountAfterCookingProductBound", editAmountAfterCookingProductBound);

    toast.show("Dane zapisane", {type: "success"});
  }

  interface ContentEl{
    header: string,
    icon: string,
    data: any[],
  }
  const content: ContentEl[] = [
    {
      header: "Baza danych",
      icon: "database",
      data: [
        <SCInput label="Adres serwera" value={dbUrl} type="url" onChange={setDbUrl} />,
        <SCInput label="Magiczne słowo" value={dbPassword} onChange={setDbPassword} password />,
      ]
    },
    {
      header: "Wyszukiwanie EANów",
      icon: "barcode",
      data: [
        <SCInput label="Adres serwera" value={eanUrl} type="url" onChange={setEanUrl} />,
        <SCInput label="Magiczne słowo" value={eanToken} onChange={setEanToken} />,
      ]
    },
    {
      header: "Wygląd",
      icon: "palette",
      data: [
        <Header level={3}>Brak ustawień... Na razie...</Header>
      ]
    },
    {
      header: "Intuicja",
      icon: "comment-dots",
      data: [
        <Header icon="scroll" level={3}>Przepisy</Header>,
        <SCInput label="Sugeruj tylko przepisy z kompletem składników" type="checkbox"
          value={suggestOnlyStockedRecipes}
          onChange={setSuggestOnlyStockedRecipes}
        />,
        <Header icon="balance-scale" level={3}>Podliczanie</Header>,
        <SCRadio label="Edytuj ilość produktu po powiązaniu ze składnikiem"
          items={editAmountAfterCookingProductBoundValues}
          value={editAmountAfterCookingProductBound}
          onChange={setEditAmountAfterCookingProductBound}
        />,
      ]
    },
  ]

  return <View style={s.wrapper}>
    <Header icon="cog" level={1}>Ustawienia</Header>
    <SectionList sections={content}
      renderItem={({item}) => item}
      renderSectionHeader={({section}) => <Header icon={section.icon}>{section.header}</Header>}
      stickySectionHeadersEnabled={true}
    />
    <SCButton icon="check" title="Zatwierdź" onPress={handleSave} />
  </View>
}
