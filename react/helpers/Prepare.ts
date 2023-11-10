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

export const prepareDashAmount = (amount_to_sub: number, stock_amount: number) =>
  stock_amount - Math.max(
    stock_amount - amount_to_sub,
    Math.ceil(stock_amount) - 1, // expecting future stock amount: (x, x+1] => x, x => x-1
  );
