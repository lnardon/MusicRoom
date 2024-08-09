/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import "./App.css";

import Sidebar from "./Components/SIdebar";
import Player from "./Components/Player";

function App() {
  const [songs, setSongs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedSong, setSelectedSong] = useState({
    filePath: "",
    title: "",
    artist: "",
    cover: "",
  });

  useEffect(() => {
    setLoading(true);
    fetch("/getAllFiles")
      .then((res) => res.json())
      .then((data) => {
        setSongs(data.files);
        setSearchResults(data.files);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setSearchResults(
      songs.filter((song: any) =>
        song.toLowerCase().includes(search.toLowerCase())
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleGetSong(song: any) {
    setSelectedSong({
      filePath: `/getSong?file=${song}`,
      title: song.split("/")[song.split("/").length - 1],
      artist: song.split("/")[song.split("/").length - 3],
      cover: `/getCover?file=${song}`,
    });
  }

  return (
    <div>
      <Sidebar />
      <Player
        filePath={selectedSong.filePath}
        title={selectedSong.title}
        artist={selectedSong.artist}
        cover={selectedSong.cover}
      />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <ul>
          {searchResults.map((song: any, index: number) => (
            <div
              style={{
                cursor: "pointer",
                textAlign: "start",
                marginBottom: "2rem",
              }}
              key={index}
              onClick={() => handleGetSong(song)}
            >
              <div>{"| " + song.split("/").slice(5, 6)}</div>
              <div>{"|---- " + song.split("/").slice(6, 7)}</div>
              <div>{"|-------- " + song.split("/").slice(7, 8)}</div>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
