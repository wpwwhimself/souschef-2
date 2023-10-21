import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs"
import Home from './components/pages/Home';
import Profile from './components/pages/Profile';
import StockHub from './components/pages/StockHub';
import { useState, useEffect } from 'react';
import { getPassword } from './helpers/PasswordStorage';
import PasswordInputModal from './components/PasswordInputModal';
import RecipesHub from './components/pages/RecipesHub';
import { ACCENT_COLOR } from './assets/constants';
import { ToastProvider } from 'react-native-toast-notifications';
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';

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
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const checkPassword = async () => {
      getPassword()
        .then(storedPassword => {
          if (!storedPassword) {
            setIsModalVisible(true);
          }
        })
        .catch(err => {
          console.error(err);
          setIsModalVisible(true);
        })
    }
    checkPassword();
  }, []);

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <PaperProvider theme={theme}>
    <ToastProvider
      placement="bottom"
      successIcon={<Icon icon="check" color="white" bounce />}
      dangerIcon={<Icon icon="x" color="white" shake />}
      >
    <NavigationContainer>
    <PasswordInputModal isVisible={isModalVisible} onClose={closeModal} />
    <Tab.Navigator
      initialRouteName='Home'
      activeColor={ACCENT_COLOR}
      >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: "Na bieżąco",
          tabBarIcon: ({color, size}) => <Icon name="house-user" color={color} size={26} solid />
        }}
        />
      <Tab.Screen
        name="StockHub"
        component={StockHub}
        options={{
          title: "Składniki",
          tabBarIcon: ({color, size}) => <Icon name="box" color={color} size={26} solid />
        }}
        />
      <Tab.Screen
        name="RecipesHub"
        component={RecipesHub}
        options={{
          title: "Przepisy",
          tabBarIcon: ({color, size}) => <Icon name="scroll" color={color} size={26} solid />
        }}
        />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          title: "Mój profil",
          tabBarIcon: ({color, size}) => <Icon name="user" color={color} size={26} solid />
        }}
        />
    </Tab.Navigator>
  </NavigationContainer>
  </ToastProvider>
  </PaperProvider>
  )
}
