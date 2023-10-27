import { View, Text } from "react-native"
import Header from "../Header"
import s from "../../assets/style"
import { useState, useEffect } from "react"
import PasswordInputModal from "../PasswordInputModal";
import { getKey, setKey } from "../../helpers/Storage";
import { SCButton, SCInput } from "../SCSpecifics";
import { useToast } from "react-native-toast-notifications";
import { useIsFocused } from "@react-navigation/native";

export default function Settings(){
  const toast = useToast();
  const isFocused = useIsFocused();

  const [dbUrl, setDbUrl] = useState("");
  const [dbPassword, setDbPassword] = useState("");
  const [eanUrl, setEanUrl] = useState("");
  const [eanToken, setEanToken] = useState("");

  const storage = {
    dbUrl: setDbUrl,
    magicWord: setDbPassword,
    eanUrl: setEanUrl,
    EANToken: setEanToken,
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

  return <View style={s.wrapper}>
    <Header icon="database">Baza danych</Header>
    <SCInput label="Adres serwera" value={dbUrl} type="url" onChange={setDbUrl} />
    <SCInput label="Magiczne słowo" value={dbPassword} onChange={setDbPassword} password />
    <SCButton icon="check" title="Zatwierdź" onPress={handleDbSave} />

    <Header icon="barcode">Wyszukiwanie EANów</Header>
    <SCInput label="Adres serwera" value={eanUrl} type="url" onChange={setEanUrl} />
    <SCInput label="Magiczne słowo" value={eanToken} onChange={setEanToken} />
    <SCButton icon="check" title="Zatwierdź" onPress={handleEanSave} />
  </View>
}
