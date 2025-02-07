import { Home, Search, Settings, BarChart2, ListMusicIcon } from "lucide-react";
import { useChangeView } from "../../utils/hooks";
import styles from "./styles.module.css";

const Sidebar = ({
  currentView,
  setCurrentView,
}: {
  currentView: string;
  setCurrentView: (view: string) => void;
}) => {
  const handleViewUpdate = useChangeView();

  const options = [
    {
      title: "Home",
      icon: (
        <Home size={22} color={currentView === "home" ? "#ffd000" : "white"} />
      )
    },
    {
      title: "Search",
      icon: (
        <Search
          size={22}
          color={currentView === "search" ? "#ffd000" : "white"}
        />
      )
    },
    {
      title: "Playlists",
      icon: (
        <ListMusicIcon
          size={22}
          color={currentView === "playlists" ? "#ffd000" : "white"}
        />
      )
    },
    {
      title: "Stats",
      icon: (
        <BarChart2
          size={22}
          color={currentView === "stats" ? "#ffd000" : "white"}
        />
      )
    },
    {
      title: "Settings",
      icon: (
        <Settings
          size={22}
          color={currentView === "settings" ? "#ffd000" : "white"}
        />
      )
    },
  ];
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Music</h1>
      {options.map((option) => {
        return (
          <div
            className={styles.button}
            onClick={() => {
              setCurrentView(option.title.toLowerCase());
              handleViewUpdate(option.title.toLowerCase());
            }}
          >
            {option.icon}
            <span
              className={styles.text}
              style={{
                fontSize: "1rem",
                fontWeight:
                  currentView === option.title.toLowerCase() ? "bold" : 400,
                color:
                  currentView === option.title.toLowerCase()
                    ? "#ffd000"
                    : "white",
              }}
            >
              {option.title}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;
