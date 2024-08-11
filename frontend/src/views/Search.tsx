/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
// import { Container } from './styles';

const Home = ({
  setSelectedSong,
}: {
  setSelectedSong: (song: any) => void;
}) => {
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
    setSelectedSong({
      filePath: `/getSong?file=${song}`,
      title: song.split("/")[song.split("/").length - 1],
      artist: song.split("/")[song.split("/").length - 3],
      cover: `/getCover?file=${song}`,
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        width: "100%",
        height: "100vh",
        padding: "2rem",
        overflowY: "scroll",
      }}
    >
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <ul
          style={{
            width: "100%",
            height: "calc(100vh - 16rem)",
            marginBottom: "6rem",
          }}
        >
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
};

export default Home;