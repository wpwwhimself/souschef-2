import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import Stock from "./Stock";
import BarcodeScanner from "./BarcodeScanner";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ACCENT_COLOR } from "../../assets/constants";
import Categories from "./Categories";
import Ingredients from "./Ingredients";
import Products from "./Products";

const Tab = createMaterialBottomTabNavigator();

export default function StockHub(){
  return <Tab.Navigator barStyle={{ backgroundColor: ACCENT_COLOR }}>
    <Tab.Screen
      name="Stock"
      component={Stock}
      options={{
        title: "Stan",
        tabBarIcon: ({color}) => <Icon name="box-open" color={color} size={26} solid />
      }}
      />
    <Tab.Screen
      name="BarcodeScanner"
      component={BarcodeScanner}
      options={{
        title: "Skanuj",
        tabBarIcon: ({color}) => <Icon name="barcode" color={color} size={26} solid />
      }}
      />
    <Tab.Screen
      name="Categories"
      component={Categories}
      options={{
        title: "Kategorie",
        tabBarIcon: ({color}) => <Icon name="boxes" color={color} size={26} solid />
      }}
      />
    <Tab.Screen
      name="Ingredients"
      component={Ingredients}
      options={{
        title: "Składniki",
        tabBarIcon: ({color}) => <Icon name="box" color={color} size={26} />
      }}
      />
    <Tab.Screen
      name="Products"
      component={Products}
      options={{
        title: "Produkty",
        tabBarIcon: ({color}) => <Icon name="flask" color={color} size={26} />
      }}
      />
  </Tab.Navigator>
}