import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import Stock from "./Stock";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ACCENT_COLOR } from "../../assets/constants";
import Categories from "./Categories";
import Ingredients from "./Ingredients";
import Products from "./Products";

const Tab = createMaterialBottomTabNavigator();

export default function StockHub(){
  const items = [
    {
      route: "Stock",
      component: Stock,
      title: "Stan",
      icon: "box-open",
    },
    {
      route: "Categories",
      component: Categories,
      title: "Kategorie",
      icon: "boxes",
    },
    {
      route: "Ingredients",
      component: Ingredients,
      title: "Składniki",
      icon: "box",
    },
    {
      route: "Products",
      component: Products,
      title: "Produkty",
      icon: "flask",
    },
  ]

  return <Tab.Navigator barStyle={{ backgroundColor: ACCENT_COLOR }}>
    {items.map((item, key) => <Tab.Screen key={key}
      name={item.route}
      component={item.component}
      options={{
        title: item.title,
        tabBarIcon: ({color}) => <Icon name={item.icon} color={color} size={26} solid />
      }}
      />)}
  </Tab.Navigator>
}
