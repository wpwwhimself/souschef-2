import Stock from "./Stock";
import Categories from "./Categories";
import Ingredients from "./Ingredients";
import Products from "./Products";
import SubHub from "../SubHub";

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

  return <SubHub menuItems={items} />
}
