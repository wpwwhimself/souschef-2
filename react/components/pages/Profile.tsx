import { View, Text, FlatList, RefreshControl } from "react-native"
import Header from "../Header"
import s from "../../assets/style"
import { FG_COLOR, LIGHT_COLOR } from "../../assets/constants"
import { useEffect, useState } from "react"
import { Log } from "../../types"
import PositionTile from "../PositionTile"
import HorizontalLine from "../HorizontalLine"
import { rqGet } from "../../helpers/SCFetch"
import { useToast } from "react-native-toast-notifications"
import moment from "moment"
import { useIsFocused } from "@react-navigation/native"

export default function Profile(){
  const toast = useToast()
  const isFocused = useIsFocused()
  const [logs, setLogs] = useState<Log[]>()
  const [smallLoaderVisible, setSmallLoaderVisible] = useState(true)

  const logCauseDict = {
    inventory: "inwentaryzacja",
    recipe: "przepis",
  }

  const getLogs = () => {
    setSmallLoaderVisible(true)

    rqGet("logs")
      .then(res => setLogs(res))
      .catch(err => toast.show(err.message, {type: "danger"}))
      .finally(() => setSmallLoaderVisible(false))
  }

  useEffect(() => {
    if (isFocused) getLogs()
  }, [isFocused])

  return <View style={s.wrapper}>
    <Header icon="user" level={1}>Moje dane</Header>

    <Header icon="chart-line">Statystyki kucharzowania</Header>
    <Text style={{color: FG_COLOR}}>🚧 Tu wkrótce coś będzie...</Text>

    <Header icon="truck-loading">Ostatnie zmiany stanów</Header>
    <FlatList data={logs}
      refreshControl={<RefreshControl refreshing={smallLoaderVisible} onRefresh={getLogs} />}
      renderItem={({item}) =>
        <PositionTile
          icon={item.product.ingredient.category.symbol}
          title={item.product.name}
          subtitle={[
            item.product.ingredient.name,
            [
              logCauseDict[item.cause],
              item.cause_id,
            ].filter(Boolean).join(": "),
            item.cause_id,
          ].filter(Boolean).join(" • ")}
          buttons={<View style={s.alignRight}>
            <Text style={item.difference <= 0 && s.error}>{item.difference} {item.product.ingredient.unit}</Text>
            <Text style={{ color: LIGHT_COLOR }}>{moment(item.updated_at).fromNow()}</Text>
          </View>}
        />
      }
      ItemSeparatorComponent={() => <HorizontalLine />}
      ListEmptyComponent={<Header level={3}>Brak wpisów</Header>}
      />
  </View>
}
