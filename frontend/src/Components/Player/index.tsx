import { useState, useRef, useEffect } from "react";
import AnimatedText from "animated-text-letters";
import {
  Play,
  Pause,
  Repeat2,
  Dices,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { useUrlStore } from "../../stores/urlStore";

import "animated-text-letters/index.css";
import styles from "./styles.module.css";

const Player: React.FC = () => {
  const {
    cover,
    filePath,
    title,
    artist,
    isPlaying,
    setIsPlaying,
    isRepeating,
    isShuffled,
    setIsRepeating,
    setIsShuffled,
  } = usePlayerStore();
  const setUrl = useUrlStore((state) => state.setUrl);

  const [progress, setProgress] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = (): void => {
    const audio = audioRef.current;
    if (audio) {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
      setIsPlaying(!audio.paused);
    }
  };

  useEffect(() => {
    const handleTimeUpdate = (): void => {
      const audio = audioRef.current;
      if (audio) {
        const { currentTime, duration } = audio;
        const progress = (currentTime / duration) * 100;
        setProgress(progress);
      }
    };

    const audioElem = audioRef.current;
    if (audioElem) {
      audioElem.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (audioElem) {
        audioElem.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [audioRef]);

  const handleTimelineClick = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    const timeline = event.currentTarget;
    const rect = timeline.getBoundingClientRect(); // Getting the bounds of the timeline
    const offsetX = event.clientX - rect.left; // Correctly calculating the offset
    const audio = audioRef.current;
    if (audio && timeline) {
      const newTime = (offsetX / rect.width) * audio.duration;
      audio.currentTime = newTime;
    }
  };

  function formatTime(seconds = 0): string {
    if (isNaN(seconds)) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const paddedSeconds = remainingSeconds.toString().padStart(2, "0");
    return `${minutes}:${paddedSeconds}`;
  }

  function handleClick(artist: string) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("artist", artist);
    searchParams.set("view", "artist_profile");
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );
    setUrl(window.location.search);
  }

  return (
    <div className={styles.container}>
      <div className={styles.trackInfo}>
        {cover !== "" && (
          <img key={cover} src={cover} alt={title} className={styles.cover} />
        )}
        <div className={styles.text}>
          <span className={styles.title}>
            <AnimatedText
              text={title}
              animation="appear"
              delay={16}
              easing="ease"
              transitionOnlyDifferentLetters={true}
              animationDuration={800}
            />
          </span>
          <span className={styles.artist} onClick={() => handleClick(artist)}>
            <AnimatedText
              text={artist}
              animation="slide-up"
              delay={26}
              easing="ease"
              transitionOnlyDifferentLetters={true}
              animationDuration={700}
            />
          </span>
        </div>
      </div>

      <div>
        <div className={styles.controls}>
          <button>
            <Repeat2
              size={20}
              color={isRepeating ? "#ffd000" : "rgba(255, 255, 255, 0.4)"}
              onClick={() => setIsRepeating(!isRepeating)}
            />
          </button>
          <button>
            <SkipBack />
          </button>
          <button onClick={handlePlayPause}>
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button>
            <SkipForward />
          </button>
          <button>
            <Dices
              size={20}
              color={isShuffled ? "#ffd000" : "rgba(255, 255, 255, 0.4)"}
              onClick={() => setIsShuffled(!isShuffled)}
            />
          </button>
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0rem 0.125rem",
            marginBottom: "0.25rem",
            fontSize: "0.8rem",
            color: "rgba(255, 255, 255, 0.8)",
          }}
        >
          <span>
            {audioRef.current
              ? formatTime(audioRef.current.currentTime)
              : "0:00"}
          </span>
          <span>
            {audioRef.current ? formatTime(audioRef.current.duration) : "0:00"}
          </span>
        </div>
        <div className={styles.timeline} onClick={handleTimelineClick}>
          <div className={styles.progress}>
            <div className={styles.bar}>
              <div
                className={styles.fill}
                style={{
                  width: `${progress}%`,
                }}
              ></div>
              <div
                className={styles.handle}
                style={{
                  left: `calc(${progress}% - 0.5rem)`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} autoPlay src={filePath}></audio>
    </div>
  );
};

export default Player;
