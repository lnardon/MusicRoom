/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import AnimatedText from "animated-text-letters";
import { usePlayerStore } from "../../stores/playerStore";

interface PlaylistInterface {
  id: string;
  name: string;
  cover: string;
  songs: {
    title: string;
    artist_name: string;
    album_title: string;
    album_id: string;
  }[];
}

const Playlist: React.FC = () => {
  const [playlist, setPlaylist] = useState<PlaylistInterface>(
    {} as PlaylistInterface
  );
  const { setSong, setIsPlaying } = usePlayerStore();

  function handleClick(track: any) {
    setSong({
      title: track.title,
      artist: {
        name: track.artist_name,
        id: track.artist_id,
      },
      cover: `/getCover?file=${track.album_id}`,
      file: `/getSong?file=${track.id}`,
    });
    setIsPlaying(true);
  }

  useEffect(() => {
    fetch(
      `/getPlaylist?id=${
        new URLSearchParams(window.location.search).get("playlist") || ""
      }`
    )
      .then((response) => response.json())
      .then((data) => {
        setPlaylist(data);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          src={playlist?.cover || "https://via.placeholder.com/150"}
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
            />
          </h1>
          <p>{`${playlist?.songs?.length || 0} songs`}</p>
        </div>
      </div>

      {
        <div className={styles.playlist}>
          {playlist?.songs?.map((song, index) => (
            <div
              key={index}
              className={styles.song}
              onClick={() => handleClick(song)}
              style={{
                animationDelay: `${index * 64}ms`,
                backgroundColor:
                  index % 2 === 0 ? "rgba(0,0,0,0.84)" : "rgba(0,0,0,0.44)",
              }}
            >
              <span
                style={{
                  marginRight: "0.25rem",
                }}
              >
                {index + 1}
              </span>
              <img
                src={`/getCover?file=${song.album_id}`}
                alt="cover"
                className={styles.songCover}
              />
              <div className={styles.songName}>{song.title}</div>-
              <div className={styles.songArtist}>{song.artist_name}</div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default Playlist;
