import { useState, useEffect } from "react";
import { usePlayerStore } from "../../stores/playerStore";
import { useUrlStore } from "../../stores/urlStore";
import styles from "./styles.module.css";
import AlbumCard from "../../Components/AlbumCard";
import SongTableCell from "../../Components/SongTableCell";
import { Track, Album } from "../../types";

const Home: React.FC = () => {
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [lastAlbums, setLastAlbums] = useState([]);

  function handleClick(track: Track) {
    usePlayerStore.getState().setSong({
      id: track.id,
      title: track.title,
      artist: track.artist,
      cover: `/api/getCover?file=${track.album}`,
      file: `/api/getSong?file=${track.id}`,
    });
    usePlayerStore.getState().setIsPlaying(true);
  }

  function openAlbum(album: Album) {
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

  useEffect(() => {
    fetch("/api/getHistory")
      .then((res) => res.json())
      .then((data) => {
        setRecentlyPlayed(data.songs);
        setLastAlbums(data.albums);
      })
      .catch((err) => {
        console.error(err);
        alert("An error occurred");
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.albumsContainer}>
        <h3 className={styles.subtitle}>Last Albums:</h3>
        <div className={styles.albums}>
          {lastAlbums.map((album: Album, index: number) => (
            <AlbumCard
              key={album.id}
              onClick={() => openAlbum(album)}
              album={album}
              index={index}
            />
          ))}
        </div>
      </div>

      <h4 className={styles.subtitle}>Recently Played:</h4>
      <div className={styles.tracksContainer}>
        {recentlyPlayed?.map((track: Track, index: number) => (
          <SongTableCell
            key={track.id}
            track={track}
            index={index}
            handleClick={handleClick}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
