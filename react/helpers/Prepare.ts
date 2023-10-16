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