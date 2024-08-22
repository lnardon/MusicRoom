import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import AnimatedText from "animated-text-letters";
import { useUrlStore } from "../../stores/urlStore";

const Playlists = () => {
  const [playlists, setPlaylists] = useState<
    {
      id: number;
      name: string;
      cover: string;
      description: string;
    }[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setUrl } = useUrlStore();

  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [playlistCover, setPlaylistCover] = useState("");

  function createPlaylist() {
    fetch("/createPlaylist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlistName,
        cover: playlistCover,
      }),
    }).then((res) => {
      setIsModalOpen(false);
      setPlaylistName("");
      setPlaylistCover("");
      setPlaylistDescription("");
      if (res.status === 200) {
        alert("Playlist created successfully!");
      }
    });
  }

  function handleClick(id: number) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("playlist", id.toString());
    searchParams.set("view", "playlist");
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );
    setUrl(window.location.search);
  }

  useEffect(() => {
    fetch("/getAllPlaylists")
      .then((res) => res.json())
      .then((data) => {
        setPlaylists(data);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <AnimatedText
            text="Playlists"
            animation="fade-in"
            delay={64}
            easing="ease"
            transitionOnlyDifferentLetters={true}
            animationDuration={800}
          />
        </h1>
        <button className={styles.button} onClick={() => setIsModalOpen(true)}>
          + Create Playlist
        </button>
      </div>

      {playlists?.map((playlist, index) => (
        <div
          className={styles.playlist}
          key={playlist.id}
          style={{
            animationDelay: `${index * 64}ms`,
          }}
          onClick={() => handleClick(playlist.id)}
        >
          <img
            className={styles.cover}
            src={playlist.cover}
            alt="playlist cover"
          />
          <h3 className={styles.playlistName}>{playlist.name}</h3>
        </div>
      ))}

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.content}>
            <h2 className={styles.modalTitle}>Create Playlist</h2>
            <input
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              type="text"
              placeholder="Playlist Name"
              className={styles.input}
            />
            <input
              value={playlistCover}
              onChange={(e) => setPlaylistCover(e.target.value)}
              type="text"
              placeholder="Playlist Cover"
              className={styles.input}
            />
            <textarea
              value={playlistDescription}
              onChange={(e) => setPlaylistDescription(e.target.value)}
              placeholder="Playlist Description"
              className={styles.textarea}
            />
            <button
              className={styles.modalBtn}
              onClick={createPlaylist}
              disabled={
                !(playlistName.length > 2) || !(playlistCover.length > 2)
              }
            >
              Create
            </button>
            <button
              className={styles.modalBtn}
              onClick={() => setIsModalOpen(false)}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "1px solid #ffd000",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
