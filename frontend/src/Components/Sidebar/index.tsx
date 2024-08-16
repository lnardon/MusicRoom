import { Home, Search, Settings, BarChart2, ListMusicIcon } from "lucide-react";
import styles from "./styles.module.css";

const Sidebar = ({
  currentView,
  setCurrentView,
}: {
  currentView: string;
  setCurrentView: (view: string) => void;
}) => {
  return (
    <div className={styles.container}>
      <h1
        style={{
          marginBottom: "2rem",
        }}
      >
        MusiCO
      </h1>
      <div className={styles.button} onClick={() => setCurrentView("home")}>
        <Home size={22} color={currentView === "home" ? "#ffd000" : "white"} />
        <span
          className={styles.text}
          style={{
            fontSize: "1rem",
            fontWeight: currentView === "home" ? "bold" : 400,
            color: currentView === "home" ? "#ffd000" : "white",
          }}
        >
          Home
        </span>
      </div>
      <div className={styles.button} onClick={() => setCurrentView("search")}>
        <Search
          size={22}
          color={currentView === "search" ? "#ffd000" : "white"}
        />
        <span
          className={styles.text}
          style={{
            fontSize: "1rem",
            fontWeight: currentView === "search" ? "bold" : 400,
            color: currentView === "search" ? "#ffd000" : "white",
          }}
        >
          Search
        </span>
      </div>
      <div
        className={styles.button}
        style={{
          opacity: 0.3,
        }}
      >
        <ListMusicIcon
          size={22}
          color={currentView === "playlist" ? "#ffd000" : "white"}
        />
        <span
          className={styles.text}
          style={{
            fontSize: "1rem",
            fontWeight: currentView === "playlist" ? "bold" : 400,
            color: currentView === "playlist" ? "#ffd000" : "white",
          }}
        >
          Playlist
        </span>
      </div>
      <div className={styles.button} onClick={() => setCurrentView("stats")}>
        <BarChart2
          size={22}
          color={currentView === "stats" ? "#ffd000" : "white"}
        />
        <span
          className={styles.text}
          style={{
            fontSize: "1rem",
            fontWeight: currentView === "stats" ? "bold" : 400,
            color: currentView === "stats" ? "#ffd000" : "white",
          }}
        >
          Stats
        </span>
      </div>
      <div
        className={styles.button}
        style={{
          opacity: 0.3,
        }}
      >
        <Settings
          size={22}
          color={currentView === "settings" ? "#ffd000" : "white"}
        />
        <span
          className={styles.text}
          style={{
            fontSize: "1rem",
            fontWeight: currentView === "settings" ? "bold" : 400,
            color: currentView === "settings" ? "#ffd000" : "white",
          }}
        >
          Settings
        </span>
      </div>
    </div>
  );
};

export default Sidebar;
