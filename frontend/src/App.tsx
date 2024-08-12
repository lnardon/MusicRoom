import { useEffect, useState } from "react";
import "./App.css";

import { useUrlStore } from "./stores/urlStore";
import Sidebar from "./Components/Sidebar";
import Player from "./Components/Player";
import Search from "./views/Search";
import Home from "./views/Home";
import ArtistProfile from "./views/ArtistProfile";
import Album from "./views/Album";

function App() {
  const url = useUrlStore((state) => state.url);
  const [currentView, setCurrentView] = useState(
    new URLSearchParams(url).get("view") || "home"
  );

  function getView() {
    switch (currentView) {
      case "search":
        return <Search />;
      case "home":
        return <Home />;
      case "artist_profile":
        return <ArtistProfile />;
      case "album":
        return <Album />;
      default:
        return <Home />;
    }
  }

  useEffect(() => {
    useUrlStore.setState({ url: window.location.search });
    setCurrentView(new URLSearchParams(url).get("view") || "home");
  }, [url]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "100vh",
        }}
      >
        <Sidebar setCurrentView={setCurrentView} />
        {getView()}
      </div>
      <Player />
    </div>
  );
}

export default App;
