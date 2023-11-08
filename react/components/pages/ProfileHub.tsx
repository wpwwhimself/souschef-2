import Profile from "./Profile";
import Settings from "./Settings";
import About from "./About";
import SubHub from "../SubHub";

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
    {
      route: "About",
      component: About,
      title: "O aplikacji",
      icon: "question-circle",
    },
  ]

  return <SubHub menuItems={items} />
}
