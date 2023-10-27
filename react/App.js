import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs"
import Home from './components/pages/Home';
import StockHub from './components/pages/StockHub';
import RecipesHub from './components/pages/RecipesHub';
import { ACCENT_COLOR } from './assets/constants';
import { ToastProvider } from 'react-native-toast-notifications';
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { StatusBar } from 'react-native';
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
      title: "Składniki",
      icon: "box",
    },
    {
      route: "RecipesHub",
      component: RecipesHub,
      title: "Przepisy",
      icon: "scroll",
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
      successIcon={<Icon icon="check" color="white" />}
      dangerIcon={<Icon icon="times" color="white" />}
      >
    <NavigationContainer>
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
