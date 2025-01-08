import { useEffect, useState } from "react";
import { useUrlStore } from "./stores/urlStore";
import Sidebar from "./Components/Sidebar";
import Player from "./Components/Player";
import Search from "./views/Search";
import Home from "./views/Home";
import ArtistProfile from "./views/ArtistProfile";
import Album from "./views/Album";
import Stats from "./views/Stats";
import Lyrics from "./views/Lyrics";
import Playlists from "./views/Playlists";
import Playlist from "./views/Playlist";
import "./App.css";

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
      case "stats":
        return <Stats />;
      case "lyrics":
        return <Lyrics />;
      case "playlists":
        return <Playlists />;
      case "playlist":
        return <Playlist />;
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
      <div className="views">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        {getView()}
      </div>
      <Player />
    </div>
  );
}

export default App;
