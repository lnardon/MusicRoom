/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { usePlayerStore } from "../../stores/playerStore";
import { useUrlStore } from "../../stores/urlStore";

import styles from "./styles.module.css";
import AnimatedText from "animated-text-letters";

const Home = () => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);

  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const { setSong, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    setLoading(true);
    fetch("/getAllFiles")
      .then((res) => res.json())
      .then((data) => {
        setSongs(data.files);
        setFilteredSongs(data.files);
        setLoading(false);
      });

    fetch("/getAllArtists")
      .then((res) => res.json())
      .then((data) => {
        setArtists(data);
        setFilteredArtists(data);
      });
  }, []);

  useEffect(() => {
    setFilteredSongs(
      songs.filter((song: any) =>
        song.toLowerCase().includes(search.toLowerCase())
      )
    );

    setFilteredArtists(
      artists.filter((artist: any) =>
        artist.name.toLowerCase().includes(search.toLowerCase())
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleGetSong(song: any) {
    setSong({
      file: `/getSong?file=${song}`,
      title: song.split("/")[song.split("/").length - 1],
      artist: song.split("/")[song.split("/").length - 3],
      cover: `/getCover?file=${song}`,
    });
    setIsPlaying(true);
  }

  function handleOpenArtistProfile(artist: any) {
    const searchParams = new URLSearchParams();
    searchParams.set("artist", artist.id);
    searchParams.set("view", "artist_profile");
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );
    useUrlStore.getState().setUrl(window.location.search);
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <AnimatedText
          text="Search"
          animation="fade-in"
          delay={64}
          easing="ease"
          transitionOnlyDifferentLetters={true}
          animationDuration={800}
        />
      </h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.input}
        placeholder="Search for songs, artists, and albums..."
      />
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <>
          <div className={styles.artistsContainer}>
            {filteredArtists.map((artist: any, index: number) => (
              <div
                className={styles.artist}
                key={index}
                onClick={() => handleOpenArtistProfile(artist)}
              >
                <img
                  src="https://st3.depositphotos.com/9998432/13335/v/450/depositphotos_133351928-stock-illustration-default-placeholder-man-and-woman.jpg"
                  alt=""
                  className={styles.avatar}
                />
                <p>{artist.name}</p>
              </div>
            ))}
          </div>
          <ul
            style={{
              width: "100%",
            }}
          >
            {filteredSongs.map((song: any, index: number) => (
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
        </>
      )}
    </div>
  );
};

export default Home;
