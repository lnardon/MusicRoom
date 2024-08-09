import { useState } from "react";
import "./App.css";

import Sidebar from "./Components/SIdebar";
import Player from "./Components/Player";
import Search from "./views/Search";
import Home from "./views/Home";

function App() {
  const [currentView, setCurrentView] = useState("search");
  const [selectedSong, setSelectedSong] = useState({
    filePath: "",
    title: "",
    artist: "",
    cover: "",
  });

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
        {currentView === "search" ? (
          <Search setSelectedSong={setSelectedSong} />
        ) : (
          <Home />
        )}
      </div>
      <Player
        filePath={selectedSong.filePath}
        title={selectedSong.title}
        artist={selectedSong.artist}
        cover={selectedSong.cover}
      />
    </div>
  );
}

export default App;
