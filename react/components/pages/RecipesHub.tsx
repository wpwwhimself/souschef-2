import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import Recipes from "./Recipes";
import ModRecipe from "./ModRecipe";
import { ACCENT_COLOR } from "../../assets/constants";
import Icon from "react-native-vector-icons/FontAwesome5";

const Tab = createMaterialBottomTabNavigator();

export default function RecipesHub(){
  return <Tab.Navigator barStyle={{ backgroundColor: ACCENT_COLOR }}>
    <Tab.Screen
      name="Recipes"
      component={Recipes}
      options={{
        title: "Lista",
        tabBarIcon: ({color}) => <Icon name="list" color={color} size={26} solid />
      }}
      />
    <Tab.Screen
      name="ModRecipe"
      component={ModRecipe}
      options={{
        title: "Dodaj",
        tabBarIcon: ({color}) => <Icon name="plus" color={color} size={26} solid />
      }}
      />
  </Tab.Navigator>
}