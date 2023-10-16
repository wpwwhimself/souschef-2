import { ACCENT_COLOR } from "../assets/constants"
import { Button } from "react-native"
import { TextInput, Modal, Portal } from "react-native-paper";
import { InputModeOptions, StyleSheet, Switch, Text, View } from "react-native";
import { pl, registerTranslation, DatePickerInput } from 'react-native-paper-dates'
import s from "../assets/style"
import DropDown from "react-native-paper-dropdown"
import { SelectItem } from "../types"
import { BlurView } from "expo-blur"
import BarText from "./BarText"
import { useState } from "react";
import { prepareDate } from "../helpers/Prepare";
import Icon from "react-native-vector-icons/FontAwesome5";

registerTranslation('pl', pl)

export function SCButton({title, onPress, color = ACCENT_COLOR, icon = undefined}){
  return <Icon.Button name={icon || "angle-double-right"} onPress={onPress} backgroundColor={color}>
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
  style = {},
}){
  return <View style={[ssinput.container, s.flexRight, s.nowrap]}>
    {
      type === "date" 
    ? <DatePickerInput
        locale="pl"
        label={label}
        value={value ? new Date(value) : undefined}
        onChange={(nv) => onChange(prepareDate(nv))}
        onChangeText={(nv) => onChange(nv ? prepareDate(new Date(nv)) : null)}
        inputMode="start"
        mode="outlined"
        />
    : type === "checkbox"
    ? <>
      {label && <Text>{label}</Text>}
      <View style={s.center}>
        <Switch
          trackColor={{ false: "dimgray", true: ACCENT_COLOR }}
          value={value}
          onValueChange={onChange}
        />
      </View>
    </>
    : <TextInput
      label={label}
      disabled={type == "dummy"}
      autoFocus={focus}
      inputMode={type as InputModeOptions}
      mode="outlined"
      value={value ?? ""}
      onChangeText={onChange}
      secureTextEntry={password}
      />
    }
  </View>
}

const ssinput = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: 'lightgray',
    paddingHorizontal: 10,
    width: 200,
    marginBottom: 10,
  },
})

export function SCSelect({
  label,
  value,
  items,
  onChange,
  style = {},
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
      dropDownItemSelectedStyle={{ zIndex: 999 }}
      dropDownStyle={{ zIndex: 999 }}
      />
  </View>
}

const ssselect = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 0,
  },
})

export function SCModal({title = undefined, visible, onRequestClose, children}){
  return <Portal>
    <Modal
      visible={visible}
      onDismiss={onRequestClose}
      style={ssmodal.outer}
      >
      <View style={ssmodal.inner}>
        {title && <BarText>{title}</BarText>}
        {children}
      </View>
    </Modal>
  </Portal>
}

const ssmodal = StyleSheet.create({
  outer: {
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    padding: 25,
    alignItems: "center",
    backgroundColor: "white",
  }
})