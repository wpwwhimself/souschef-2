import { StyleSheet } from 'react-native';
import { ACCENT_COLOR } from './constants';

export default StyleSheet.create({
  wrapper: {
    padding: 30,
    justifyContent: "flex-start",
    gap: 5,
    height: "100%",
    backgroundColor: "hsl(0, 0%, 99%)",
  },
  center: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  flexRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
  pinDownRight: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },
  accent: {
    color: ACCENT_COLOR,
  },
  bold: {
    fontWeight: "bold",
  },
  big: {
    fontSize: 16,
  },
  bigger: {
    fontSize: 20,
  },
  margin: {
    margin: 5,
  },
  nowrap: {
    flexWrap: "nowrap",
  },
  error: {
    color: "red",
  },
})