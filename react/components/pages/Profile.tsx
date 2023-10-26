import { View, Text } from "react-native"
import Header from "../Header"
import s from "../../assets/style"
import { useState, useEffect } from "react"
import PasswordInputModal from "../PasswordInputModal";
import { getKey, saveKey, deleteKey } from "../../helpers/Storage";
import { SCButton, SCInput } from "../SCSpecifics";
import { useToast } from "react-native-toast-notifications";

export default function Profile(){
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [eanApiToken, setEanApiToken] = useState("");
  const toast = useToast();

  const STKEYS = {
    DBURL: "dbUrl",
    DBPSW: "magicWord",
    EANURL: "eanUrl",
    EANTKN: "EANToken",
  }

  useEffect(() => {
    const checkToken = async () => {
      const token = await getKey(STKEYS.EANTKN);
      setEanApiToken(token ?? "");
    }
    checkToken();
  }, []);

  const saveEanToken = async () => {
    saveKey(STKEYS.EANTKN, eanApiToken);
    toast.show("Token do API EANów zapisany", {type: "success"})
  }

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return <View style={s.wrapper}>
    <Header icon="key">Magiczne słowo</Header>
    <Text>Tu znajdziesz hasło dostępu do bazy danych.</Text>
    <View style={s.flexRight}>
      <SCButton icon="wrench" title="Zmień" onPress={openModal} />
      <SCButton icon="trash" title="Usuń" onPress={deleteKey(STKEYS.DBPSW)} />
    </View>
    <PasswordInputModal isVisible={isModalVisible} onClose={closeModal} />

    <Header icon="barcode">Token do API kodów kreskowych</Header>
    <Text>
      Ta aplikacja korzysta z upcdatabase.org w celu tłumaczenia kodów kreskowych produktów.
      W pole poniżej wpisz klucz dostępu do API.
    </Text>
    <View style={s.flexRight}>
      <SCInput
        value={eanApiToken}
        onChange={setEanApiToken}
        style={{ width: 300 }}
      />
      <SCButton icon="wrench" title="Zmień" onPress={saveEanToken} />
    </View>
    <PasswordInputModal isVisible={isModalVisible} onClose={closeModal} />

    <Header icon="chart-line">Statystyki kucharzowania</Header>
  </View>
}
