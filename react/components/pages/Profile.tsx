import { View, Text } from "react-native"
import Header from "../Header"
import s from "../../assets/style"
import { useState, useEffect } from "react"
import PasswordInputModal from "../PasswordInputModal";
import { deletePassword, getEANToken, setEANToken } from "../../helpers/Storage";
import { SCButton, SCInput } from "../SCSpecifics";
import { useToast } from "react-native-toast-notifications";

export default function Profile(){
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [eanApiToken, setEanApiToken] = useState("");
  const toast = useToast();

  useEffect(() => {
    const checkToken = async () => {
      const token = await getEANToken();
      setEanApiToken(token ?? "");
    }
    checkToken();
  }, []);

  const saveEanToken = async () => {
    setEANToken(eanApiToken);
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
      <SCButton icon="trash" title="Usuń" onPress={deletePassword} />
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
