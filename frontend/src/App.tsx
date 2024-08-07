/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [songs, setSongs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    return () => {
      window.open(`/getSong?file=${song}`, "_blank");
    };
  }

  return (
    <div>
      <h1>Music Player</h1>
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
            <li key={index} onClick={handleGetSong(song)}>
              {song}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
