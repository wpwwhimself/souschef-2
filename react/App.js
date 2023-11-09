import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs"
import Home from './components/pages/Home';
import StockHub from './components/pages/StockHub';
import RecipesHub from './components/pages/RecipesHub';
import { darkmode, ACCENT_COLOR, BG2_COLOR, BG_COLOR, FG_COLOR, LIGHT_COLOR } from './assets/constants';
import { ToastProvider } from 'react-native-toast-notifications';
import { PaperProvider, DefaultTheme, MD3DarkTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { StatusBar, Text } from 'react-native';
import ProfileHub from './components/pages/ProfileHub';

const Tab = createMaterialBottomTabNavigator();

export default function App() {
  // theme
  const theme = darkmode ? {
    ...DefaultTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: ACCENT_COLOR,
      background: BG_COLOR,
      secondaryContainer: LIGHT_COLOR,
      surface: BG_COLOR,
    }
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: ACCENT_COLOR,
      background: BG_COLOR,
      secondaryContainer: LIGHT_COLOR,
      surface: BG_COLOR,
    }
  }

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
      inactiveColor={FG_COLOR}
      barStyle={{backgroundColor: BG2_COLOR}}
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
