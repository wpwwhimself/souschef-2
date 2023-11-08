import { StyleSheet, Text, View } from "react-native"
import * as Progress from "react-native-progress"
import s from "../assets/style"
import { ACCENT_COLOR, LIGHT_COLOR } from "../assets/constants"
import moment from "moment"

interface AIProps{
  amount: number,
  maxAmount?: number,
  minAmount?: number,
  unit: string,
  expirationDate?: string,
  title?: string,
  amountAsFraction?: boolean,
  highlightAt?: 0 | 1,
}

export default function AmountIndicator({amount, unit, maxAmount, expirationDate = "", minAmount, title, amountAsFraction = false, highlightAt}: AIProps){
  const dateDiff = moment(expirationDate).diff(moment(), "days") + 1;
  const dateRendered: string = (!!dateDiff)
    ? `${dateDiff} dni`
    : undefined;

  const label = [
    amountAsFraction ? `${amount}/${maxAmount} ${unit}` : `${amount} ${unit}`,
    dateRendered,
  ]

  return <View style={ss.wrapper}>
    {!!maxAmount && <Progress.Bar progress={amount / maxAmount} color={amount <= minAmount || highlightAt == amount / maxAmount ? ACCENT_COLOR : LIGHT_COLOR} width={100} />}
    <Text style={[s.text, dateDiff <= 0 && s.error]}>
      {(title ? title+": " : "") + label.filter(Boolean).join(" • ")}
    </Text>
  </View>
}

const ss = StyleSheet.create({
  wrapper: {
    alignItems: "flex-end",
  },
})
