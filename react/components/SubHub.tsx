import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ACCENT_COLOR, BG_COLOR, FG_COLOR, LIGHT_COLOR } from "../assets/constants";

const Tab = createMaterialBottomTabNavigator();

export default function SubHub({menuItems}){
  return <Tab.Navigator
    activeColor={FG_COLOR}
    inactiveColor={BG_COLOR}
    barStyle={{ backgroundColor: ACCENT_COLOR }}
    >
    {menuItems.map((item, key) => <Tab.Screen key={key}
      name={item.route}
      component={item.component}
      options={{
        title: item.title,
        tabBarIcon: ({color}) => <Icon name={item.icon} color={color} size={26} solid />
      }}
      />)}
  </Tab.Navigator>
}
