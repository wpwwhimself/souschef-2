import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import Profile from "./Profile";
import Settings from "./Settings";
import { ACCENT_COLOR } from "../../assets/constants";
import Icon from "react-native-vector-icons/FontAwesome5";

const Tab = createMaterialBottomTabNavigator();

export default function ProfileHub(){
  const items = [
    {
      route: "Profile",
      component: Profile,
      title: "Moje dane",
      icon: "user",
    },
    {
      route: "Settings",
      component: Settings,
      title: "Ustawienia",
      icon: "cog",
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
