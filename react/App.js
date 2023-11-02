import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs"
import Home from './components/pages/Home';
import StockHub from './components/pages/StockHub';
import RecipesHub from './components/pages/RecipesHub';
import { ACCENT_COLOR } from './assets/constants';
import { ToastProvider } from 'react-native-toast-notifications';
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { StatusBar, Text, View } from 'react-native';
import ProfileHub from './components/pages/ProfileHub';

const Tab = createMaterialBottomTabNavigator();

// theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: ACCENT_COLOR,
    background: "white",
    secondaryContainer: "lightgray",
    surface: "white",
  }
}
export default function App() {
  const navItems = [
    {
      route: "Home",
      component: Home,
      title: "Na bieżąco",
      icon: "house-user",
    },
    {
      route: "StockHub",
      component: StockHub,
      title: "Zapasy",
      icon: "box",
    },
    {
      route: "RecipesHub",
      component: RecipesHub,
      title: "Gotowanie",
      icon: "utensils",
    },
    {
      route: "ProfileHub",
      component: ProfileHub,
      title: "Mój profil",
      icon: "user",
    },
  ]

  return (
    <PaperProvider theme={theme}>
    <ToastProvider
      placement="top"
      successIcon={<Text>✅</Text>}
      dangerIcon={<Text>🔥</Text>}
      >
    <NavigationContainer
      documentTitle={{
        formatter: (options, route) => `${options?.title ?? route?.name} | Sous Chef 2`
      }}>
    <StatusBar barStyle='dark-content' backgroundColor={ACCENT_COLOR} />
    <Tab.Navigator
      initialRouteName='Home'
      activeColor={ACCENT_COLOR}
      >
      {navItems.map((item, key) => <Tab.Screen key={key}
      name={item.route}
      component={item.component}
      options={{
        title: item.title,
        tabBarIcon: ({color}) => <Icon name={item.icon} color={color} size={26} solid />
      }}
      />)}
    </Tab.Navigator>
  </NavigationContainer>
  </ToastProvider>
  </PaperProvider>
  )
}
