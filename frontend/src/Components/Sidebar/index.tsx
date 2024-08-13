import { Home, Search, Settings, BarChart2, ListMusicIcon } from "lucide-react";
import styles from "./styles.module.css";

const Sidebar = ({
  setCurrentView,
}: {
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
        <Home size={22} />
        <span className={styles.text} style={{ fontSize: "1rem" }}>
          Home
        </span>
      </div>
      <div className={styles.button} onClick={() => setCurrentView("search")}>
        <Search size={22} />
        <span className={styles.text} style={{ fontSize: "1rem" }}>
          Search
        </span>
      </div>
      <div
        className={styles.button}
        style={{
          opacity: 0.3,
        }}
      >
        <ListMusicIcon size={22} />
        <span className={styles.text} style={{ fontSize: "1rem" }}>
          Playlist
        </span>
      </div>
      <div
        className={styles.button}
        style={{
          opacity: 0.3,
        }}
      >
        <BarChart2 size={22} />
        <span className={styles.text} style={{ fontSize: "1rem" }}>
          Stats
        </span>
      </div>
      <div
        className={styles.button}
        style={{
          opacity: 0.3,
        }}
      >
        <Settings size={22} />
        <span className={styles.text} style={{ fontSize: "1rem" }}>
          Settings
        </span>
      </div>
    </div>
  );
};

export default Sidebar;
