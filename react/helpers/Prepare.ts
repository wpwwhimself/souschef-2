import moment from "moment";
import { SelectItem } from "../types";

export function prepareSelectItems(
  collection: any[],
  labelName: string,
  valueName: string,
  firstEmpty = false,
){
  let ret: SelectItem[] = [];

  if(firstEmpty) ret.push({
    label: "",
    value: null,
  });
  for(let item of collection){
    ret.push({
      label: item[labelName],
      value: item[valueName],
    })
  }

  return ret;
}

export const prepareDate = (date: Date) => moment(date).format("YYYY-MM-DD");

export const dashAmountRemainderDict: SelectItem[] = [
  {label: "dużo", value: 0.75},
  {label: "połowa", value: 0.5},
  {label: "mało", value: 0.25},
  {label: "nieruszony", value: 0},
]
export const dashAmountUsedDict: SelectItem[] = [
  {label: "nic", value: 0},
  {label: "trochę", value: 0.25},
  {label: "połowa", value: 0.5},
  {label: "dużo", value: 0.75},
  {label: "wszystko", value: 1},
]
