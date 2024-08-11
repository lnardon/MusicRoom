import { useState } from "react";
import "./App.css";

import Sidebar from "./Components/SIdebar";
import Player from "./Components/Player";
import Search from "./views/Search";
import Home from "./views/Home";

function App() {
  const [currentView, setCurrentView] = useState("");

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
        {currentView === "search" ? <Search /> : <Home />}
      </div>
      <Player />
    </div>
  );
}

export default App;
