import { useEffect, useState } from "react";
import { useUrlStore } from "../../stores/urlStore";
import styles from "./styles.module.css";
import { usePlayerStore } from "../../stores/playerStore";
import AlbumCard from "../../Components/AlbumCard";
import { Album, Artist, Track } from "../../types";
import SongTableCell from "../../Components/SongTableCell";

const Home = () => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [view, setView] = useState("artists");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const { setSong, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    setLoading(true);
    if (view === "artists") {
      fetch("/getAllArtists")
        .then((res) => res.json())
        .then((data) => {
          setArtists(data);
          setFilteredArtists(data);
        });
      setLoading(false);
      return;
    }

    if (view === "songs") {
      fetch("/getAllSongs")
        .then((res) => res.json())
        .then((data) => {
          setSongs(data);
          setFilteredSongs(data);
        });
      setLoading(false);
      return;
    }

    if (view === "albums") {
      fetch("/getAllAlbums")
        .then((res) => res.json())
        .then((data) => {
          setAlbums(data);
          setFilteredAlbums(data);
        });
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    setFilteredSongs(
      songs.filter((song: Track) =>
        song.title.toLowerCase().includes(search.toLowerCase())
      )
    );

    setFilteredArtists(
      artists.filter((artist: Artist) =>
        artist.name.toLowerCase().includes(search.toLowerCase())
      )
    );

    setFilteredAlbums(
      albums.filter((album: Album) =>
        album.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [albums, artists, search, songs]);

  function handleGetSong(song: Track) {
    setSong({
      file: `/getSong?file=${song.id}`,
      title: song.title,
      artist: song.artist,
      cover: `/getCover?file=${song.album}`,
    });
    setIsPlaying(true);
  }

  function handleOpenArtistProfile(artist: Artist) {
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

  function handleOpenAlbum(album: Album) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("album", album.id);
    searchParams.set("view", "album");
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );
    useUrlStore.getState().setUrl(window.location.search);
  }

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.input}
        placeholder="Search for songs, artists, and albums..."
      />

      <div className={styles.tabs}>
        <button
          onClick={() => setView("artists")}
          className={styles.tab}
          style={{
            borderColor: view !== "artists" ? "lightgray" : "#1db954",
            color: view !== "artists" ? "white" : "#1db954",
          }}
        >
          All Artists
        </button>
        <button
          onClick={() => setView("albums")}
          className={styles.tab}
          style={{
            borderColor: view !== "albums" ? "lightgray" : "#1db954",
            color: view !== "albums" ? "white" : "#1db954",
          }}
        >
          All Albums
        </button>
        <button
          onClick={() => setView("songs")}
          className={styles.tab}
          style={{
            borderColor: view !== "songs" ? "lightgray" : "#1db954",
            color: view !== "songs" ? "white" : "#1db954",
          }}
        >
          All Songs
        </button>
      </div>

      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <>
          {view === "artists" && (
            <div className={styles.artistsContainer}>
              {filteredArtists.map((artist: Artist, index: number) => (
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
                  <p className={styles.artistName}>{artist.name}</p>
                </div>
              ))}
            </div>
          )}

          {view === "albums" && (
            <div className={styles.albumsContainer}>
              {filteredAlbums.map((album: Album, index: number) => (
                <AlbumCard
                  index={index}
                  key={index}
                  album={album}
                  onClick={() => {
                    handleOpenAlbum(album);
                  }}
                />
              ))}
            </div>
          )}

          {view === "songs" &&
            filteredSongs.map((song: Track, index: number) => (
              <SongTableCell
                index={index}
                track={song}
                handleClick={() => handleGetSong(song)}
              />
            ))}
        </>
      )}
    </div>
  );
};

export default Home;
