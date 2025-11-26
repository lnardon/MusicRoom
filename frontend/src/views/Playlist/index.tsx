/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import AnimatedText from "animated-text-letters";
import { usePlayerStore } from "../../stores/playerStore";
import { Pen, Shuffle } from "lucide-react";
import SongTableCell from "../../Components/SongTableCell";
import { apiHandler } from "../../utils/apiHandler";
import { useHandlePlaySong } from "@/utils/hooks";
import { Track } from "@/types";

interface PlaylistInterface {
  id: string;
  name: string;
  description: string;
  cover: string;
  songs: Track[];
}

const Playlist: React.FC = () => {
  const [playlist, setPlaylist] = useState<PlaylistInterface>(
    {} as PlaylistInterface,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [cover, setCover] = useState("");
  const [description, setDescription] = useState("");

  const { setQueue } = usePlayerStore();
  const handlePlaySong = useHandlePlaySong();

  function handleClick(track: any) {
    handlePlaySong(track);
    setQueue(playlist.songs);
  }

  function handleShuffle() {
    const shuffledQueue = [...playlist.songs];
    shuffledQueue.sort(() => Math.random() - 0.5);
    handlePlaySong(shuffledQueue.shift() as Track);
    setQueue(shuffledQueue);
  }

  function handleSaveEdit() {
    apiHandler("/api/editPlaylist", "POST", "application/json", {
      id: playlist.id,
      name,
      cover,
      description,
    }).then((res) => {
      if (res.status === 200) {
        setIsModalOpen(false);
        apiHandler(
          `/api/getPlaylist?id=${
            new URLSearchParams(window.location.search).get("playlist") || ""
          }`,
          "GET",
        )
          .then((response) => response.json())
          .then((data) => {
            setPlaylist(data);
          });
      }
    });
  }

  useEffect(() => {
    apiHandler(
      `/api/getPlaylist?id=${
        new URLSearchParams(window.location.search).get("playlist") || ""
      }`,
      "GET",
    )
      .then((response) => response.json())
      .then((data) => {
        setPlaylist(data);
        setName(data.name);
        setCover(data.cover);
        setDescription(data.description);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          src={playlist?.cover || "/assets/vinyl_placeholder.webp"}
          alt="Cover"
          className={styles.cover}
        />
        <div className={styles.headerText}>
          <h1 className={styles.name}>
            <AnimatedText
              text={playlist?.name || ""}
              easing="ease-in-out"
              delay={28}
              animationDuration={400}
              animation="slide-up"
              transitionOnlyDifferentLetters={true}
              style={{
                display: "flex",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            />
          </h1>
          <p>{`${playlist?.songs?.length || 0} songs`}</p>
        </div>
      </div>

      <div className={styles.buttons}>
        <button className={styles.playBtn} onClick={handleShuffle}>
          <Shuffle size={16} color="black" strokeWidth={2.5} />
          shuffle
        </button>
        <button className={styles.editBtn} onClick={() => setIsModalOpen(true)}>
          Edit
          <Pen size={12} />
        </button>
      </div>

      {
        <div className={styles.playlist}>
          {playlist?.songs?.map((song1, index) => (
            <SongTableCell
              track={song1}
              index={index}
              handleClick={() => handleClick(song1)}
            />
          ))}
        </div>
      }

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.content}>
            <h2 className={styles.modalTitle}>Edit Playlist</h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Playlist Name"
              className={styles.input}
              defaultValue={playlist.name}
            />
            <input
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              type="text"
              placeholder="Playlist Cover"
              className={styles.input}
              defaultValue={playlist.cover}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Playlist Description"
              className={styles.textarea}
              defaultValue={playlist.description}
            />
            <button className={styles.modalBtn} onClick={handleSaveEdit}>
              Save
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

export default Playlist;
