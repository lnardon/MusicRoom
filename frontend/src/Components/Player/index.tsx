import { useState, useRef, useEffect } from "react";
import styles from "./styles.module.css";

const Player = ({
  filePath,
  title,
  artist,
  cover,
}: {
  filePath: string;
  title: string;
  artist: string;
  cover: string;
}) => {
  const [isPlaying, setIsPlaying] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  function handlePlayPause() {
    audioRef.current?.paused
      ? audioRef.current?.play()
      : audioRef.current?.pause();
  }

  useEffect(() => {
    if (audioRef.current) {
      setIsPlaying(!audioRef.current.paused);
    }
  }, [audioRef.current?.paused]);

  return (
    <div className={styles.container}>
      <img src={cover} alt="cover" />
      <div className={styles.trackInfo}>
        <h2 className={styles.title}>{title}</h2>
        <h3 className={styles.artist}>{artist}</h3>
      </div>

      <div className={styles.controls}>
        <button>Prev</button>
        <button onClick={handlePlayPause}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button>Next</button>
      </div>

      <audio ref={audioRef} autoPlay src={filePath}></audio>
    </div>
  );
};

export default Player;
