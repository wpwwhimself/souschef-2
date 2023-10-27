import { StyleSheet, Text, View } from "react-native"
import * as Progress from "react-native-progress"
import s from "../assets/style"
import { ACCENT_COLOR } from "../assets/constants"
import moment from "moment"

interface AIProps{
  amount: number,
  maxAmount: number,
  minAmount?: number,
  unit: string,
  expirationDate?: string,
}

export default function AmountIndicator({amount, unit, maxAmount, expirationDate, minAmount}: AIProps){
  const dateDiff = moment(expirationDate).diff(moment(), "days") + 1;
  const dateRendered: string = (!!dateDiff)
    ? `${dateDiff} dni`
    : undefined;

  const label = [
    `${amount} ${unit}`,
    dateRendered,
  ]

  return <View style={ss.wrapper}>
    <Progress.Bar progress={amount / maxAmount} color={amount <= minAmount ? ACCENT_COLOR : "lightgray"} width={100} />
    <Text style={dateDiff <= 0 && s.error}>{label.filter(Boolean).join(" • ")}</Text>
  </View>
}

const ss = StyleSheet.create({
  wrapper: {
    alignItems: "flex-end",
  },
})