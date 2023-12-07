import { View } from "react-native"
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

  const [editAmountAfterCookingProductBound, setEditAmountAfterCookingProductBound] = useState<0 | 1 | 2>(0)
  const editAmountAfterCookingProductBoundValues: SelectItem[] = [
    { value: 0, label: "Nie" },
    { value: 1, label: "Tylko dla powolnego zużycia" },
    { value: 2, label: "Tak" },
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

  const handleDbSave = () => {
    setKey("dbUrl", dbUrl);
    setKey("magicWord", dbPassword);
    toast.show("Dane bazy zmodyfikowane", {type: "success"});
  }
  const handleEanSave = () => {
    setKey("eanUrl", eanUrl);
    setKey("EANToken", eanToken);
    toast.show("Dane dot. EAN zmodyfikowane", {type: "success"});
  }
  const handleIntSave = () => {
    setKey("editAmountAfterCookingProductBound", editAmountAfterCookingProductBound);
    toast.show("Dane dot. intuicji zmodyfikowane", {type: "success"});
  }

  return <View style={s.wrapper}>
    <Header icon="cog" level={1}>Ustawienia</Header>

    <Header icon="database">Baza danych</Header>
    <SCInput label="Adres serwera" value={dbUrl} type="url" onChange={setDbUrl} />
    <SCInput label="Magiczne słowo" value={dbPassword} onChange={setDbPassword} password />
    <SCButton icon="check" title="Zatwierdź" onPress={handleDbSave} />

    <Header icon="barcode">Wyszukiwanie EANów</Header>
    <SCInput label="Adres serwera" value={eanUrl} type="url" onChange={setEanUrl} />
    <SCInput label="Magiczne słowo" value={eanToken} onChange={setEanToken} />
    <SCButton icon="check" title="Zatwierdź" onPress={handleEanSave} />

    <Header icon="comment-dots">Intuicja</Header>
    <Header icon="balance-scale" level={3}>Podliczanie</Header>
    <SCRadio label="Edytuj ilość produktu po powiązaniu ze składnikiem"
      items={editAmountAfterCookingProductBoundValues}
      value={editAmountAfterCookingProductBound}
      onChange={setEditAmountAfterCookingProductBound}
    />
    <SCButton icon="check" title="Zatwierdź" onPress={handleIntSave} />
  </View>
}
