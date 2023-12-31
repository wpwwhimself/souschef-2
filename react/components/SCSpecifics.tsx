import { ACCENT_COLOR, BG2_COLOR, BG_COLOR, FG_COLOR, LIGHT_COLOR } from "../assets/constants"
import { Button } from "react-native"
import { TextInput, Modal, Portal, RadioButton } from "react-native-paper";
import { InputModeOptions, StyleSheet, Switch, Text, View } from "react-native";
import { pl, registerTranslation, DatePickerInput } from 'react-native-paper-dates'
import s from "../assets/style"
import DropDown from "react-native-paper-dropdown"
import BarText from "./Header"
import { useState } from "react";
import { prepareDate } from "../helpers/Prepare";
import Icon from "react-native-vector-icons/FontAwesome5";
import Loader from "./Loader";
import { SelectItem } from "../types";

registerTranslation('pl', pl)

export function SCButton({title = undefined, onPress, color = ACCENT_COLOR, icon = undefined, small = false}){
  return <Icon.Button
    name={icon || "angle-double-right"}
    onPress={onPress}
    backgroundColor={color}
    size={small ? 15 : 20}
    iconStyle={!title ? {marginRight: 0} : {}}
    >
    {title}
  </Icon.Button>
}

export function SCInput({
  label = undefined,
  focus = false,
  type = "text",
  value,
  onChange,
  password = false,
}){
  return <View style={[ssinput.container, s.flexRight, s.nowrap]}>
    {
      type === "date"
    ? <>
      <DatePickerInput
        locale="pl"
        label={label}
        value={value ? new Date(value) : undefined}
        onChange={(nv) => onChange(prepareDate(nv))}
        // onChangeText={(nv) => onChange(nv ? prepareDate(new Date(nv)) : null)}
        inputMode="start"
        mode="outlined"
        validRange={{startDate: new Date()}}
        />
      <SCButton
        color={LIGHT_COLOR}
        icon="calendar-times"
        onPress={() => onChange("")}
        />
    </>
    : type === "checkbox"
    ? <>
      {label && <Text style={{color: FG_COLOR}}>{label}</Text>}
      <View style={s.center}>
        <Switch
          trackColor={{ false: "dimgray", true: ACCENT_COLOR }}
          value={!!value}
          onValueChange={onChange}
        />
      </View>
    </>
    : <TextInput
      label={label}
      disabled={type == "dummy"}
      autoFocus={focus}
      inputMode={(type == "dummy" ? "text" : type.toLocaleLowerCase()) as InputModeOptions}
      mode="outlined"
      multiline={type === "TEXT"}
      value={String(value ?? "")}
      onChangeText={(nv) => type == "numeric" ? onChange(nv.replace(/,/g, ".")) : onChange(nv)}
      secureTextEntry={password}
      style={{width: "100%"}}
      selectTextOnFocus={true}
      />
    }
  </View>
}

const ssinput = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    alignItems: "center",
  },
})

export function SCSelect({
  label,
  value,
  items,
  onChange,
}){
  const [showdd, setShowdd] = useState(false)

  return <View style={[ssselect.container, s.flexRight]}>
    <DropDown
      visible={showdd}
      showDropDown={() => setShowdd(true)}
      onDismiss={() => setShowdd(false)}
      label={label}
      mode="outlined"
      value={value}
      setValue={onChange}
      list={items}
      dropDownItemStyle={{ zIndex: 999 }}
      dropDownItemSelectedStyle={{ zIndex: 999, backgroundColor: BG2_COLOR }}
      dropDownItemTextStyle={{ color: FG_COLOR }}
      dropDownStyle={{ zIndex: 999 }}
      />
  </View>
}

const ssselect = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
})

interface RadioProps{
  label: string,
  value: any,
  items: SelectItem[],
  onChange: any,
}
export function SCRadio({label, value, items, onChange}: RadioProps){
  return <View style={[s.flexRight, ssradio.container]}>
    {label && <Text style={{color: FG_COLOR}}>{label}</Text>}
    <View>
      {items.map((item) => <View style={[s.flexRight]} key={item.label}>
        <RadioButton
          value={item.value}
          status={value === item.value ? "checked" : "unchecked"}
          onPress={() => onChange(item.value)}
        />
        <Text style={{color: FG_COLOR}}>{item.label}</Text>
      </View>)}
    </View>
  </View>
}

const ssradio = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
})


export function SCModal({title = undefined, visible, loader = false, onRequestClose, children}){
  return <Portal>
    <Modal
      visible={visible}
      onDismiss={onRequestClose}
      style={ssmodal.outer}
      >
      <View style={ssmodal.inner}>
      {loader ? <Loader /> : <>
        {title && <BarText level={1}>{title}</BarText>}
        {children}
      </>}
      </View>
    </Modal>
  </Portal>
}

const ssmodal = StyleSheet.create({
  outer: {
    padding: 25,
  },
  inner: {
    padding: 25,
    gap: 5,
    backgroundColor: BG_COLOR,
  }
})
