import Recipes from "./Recipes";
import Icon from "react-native-vector-icons/FontAwesome5";
import CookingMode from "./CookingMode";
import SubHub from "../SubHub";

export default function RecipesHub(){
  const items = [
    {
      route: "Recipes",
      component: Recipes,
      title: "Przepisy",
      icon: "scroll",
    },
    {
      route: "CookingMode",
      component: CookingMode,
      title: "Podliczanie",
      icon: "balance-scale",
    },
  ]

  return <SubHub menuItems={items} />
}
