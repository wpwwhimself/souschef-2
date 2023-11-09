import { Appearance } from "react-native";

const colorScheme = Appearance.getColorScheme();
export const darkmode = (colorScheme === "dark");

export const ACCENT_COLOR = "#ff9900";
export const FG_COLOR = darkmode ? "hsl(0, 0%, 99%)" : "hsl(0, 0%, 1%)";
export const LIGHT_COLOR = darkmode ? "hsl(0, 0%, 30%)" : "hsl(0, 0%, 80%)";
export const BG_COLOR = darkmode ? "hsl(35, 20%, 5%)" : "hsl(35, 20%, 95%)";
export const BG2_COLOR = darkmode ? "hsl(35, 20%, 15%)" : "hsl(35, 20%, 85%)";
export const BG3_COLOR = darkmode ? "hsl(35, 70%, 45%)" : ACCENT_COLOR;
