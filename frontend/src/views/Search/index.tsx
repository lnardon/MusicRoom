import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import AlbumCard from "../../Components/AlbumCard";
import { Album, Artist, Track } from "../../types";
import SongTableCell from "../../Components/SongTableCell";
import { apiHandler } from "../../utils/apiHandler";
import { useHandlePlaySong, useHandleOpenArtist, useHandleOpenAlbum } from "../../utils/hooks"
import styles from "./styles.module.css";

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

  const handleOpenArtist = useHandleOpenArtist();
  const handlePlaySong = useHandlePlaySong();
  const handleOpenAlbum = useHandleOpenAlbum();

  const { ref } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    setLoading(true);
    if (view === "artists") {
      apiHandler("/api/getAllArtists", "GET")
        .then((res) => res.json())
        .then((data) => {
          setArtists(data);
          setFilteredArtists(data);
        });
      setLoading(false);
      return;
    }

    if (view === "songs") {
      apiHandler("/api/getAllSongs","GET")
        .then((res) => res.json())
        .then((data) => {
          setSongs(data);
          setFilteredSongs(data);
        });
      setLoading(false);
      return;
    }

    if (view === "albums") {
      apiHandler("/api/getAllAlbums","GET")
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
                  onClick={() => handleOpenArtist(artist)}
                >
                  <img
                    src="/assets/avatar_placeholder.jpg"
                    alt=""
                    className={styles.avatar}
                  />
                  <p className={styles.artistName}>{artist.name}</p>
                </div>
              ))}
            </div>
          )}

          {view === "albums" && (
            <div ref={ref} className={styles.albumsContainer}>
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
            <div ref={ref}>
              {            
                filteredSongs.map((song: Track, index: number) => (
                  <SongTableCell
                    index={index}
                    track={song}
                    handleClick={() => handlePlaySong(song)}
                  />
                ))
              }
            </div>
          }
        </>
      )}
    </div>
  );
};

export default Home;
