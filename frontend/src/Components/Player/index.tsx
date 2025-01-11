import { useState, useRef, useEffect } from "react";
import AnimatedText from "animated-text-letters";
import {
  Play,
  Pause,
  Repeat2,
  Dices,
  SkipForward,
  SkipBack,
  // MicVocal,
} from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { useUrlStore } from "../../stores/urlStore";
import { useAudioAnalyser } from "./analyser";
import "animated-text-letters/index.css";
import styles from "./styles.module.css";
import { HandleFallbackImage } from "../../utils/helpers";

const Player: React.FC = () => {
  const {
    song: { title, artist, cover, file },
    setSong,
    isPlaying,
    setIsPlaying,
    isRepeating,
    isShuffled,
    setIsRepeating,
    setIsShuffled,
    queue,
    setQueue,
    setAudioRef,
    setFreq1,
    setFreq2,
  } = usePlayerStore();
  const setUrl = useUrlStore((state) => state.setUrl);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyser = useAudioAnalyser(audioRef, isPlaying);
  const [progress, setProgress] = useState<number>(0);

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
      audioElem.addEventListener("ended", () => {
        if (queue.length > 0) {
          const nextSong = queue.shift();
          setSong(nextSong!);
          setQueue(queue);
          audioElem.play();
          setIsPlaying(true);
          return;
        }

        setIsPlaying(false);
      });
    }

    if (audioElem) setAudioRef(audioElem);

    setInterval(() => {
      analyser.startAnalyser(setFreq1, setFreq2);
    }, 50);

    return () => {
      if (audioElem) {
        audioElem.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRef, queue]);

  const handleTimelineClick = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    const timeline = event.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
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
        {HandleFallbackImage(cover, styles.cover)}
        <div className={styles.text}>
          <span className={styles.title}>
            <AnimatedText
              text={title}
              animation="appear"
              delay={16}
              easing="ease"
              transitionOnlyDifferentLetters={true}
              animationDuration={800}
              style={{
                display: "flex",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            />
          </span>
          <span
            className={styles.artist}
            onClick={() => handleClick(artist.id)}
          >
            <AnimatedText
              text={artist.name}
              animation="slide-up"
              delay={26}
              easing="ease"
              transitionOnlyDifferentLetters={true}
              animationDuration={700}
              style={{
                display: "flex",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            />
          </span>
        </div>
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.controls}>
          <button>
            <Repeat2
              size={20}
              color={isRepeating ? "#ffd000" : "rgba(255, 255, 255, 0.4)"}
              onClick={() => setIsRepeating(!isRepeating)}
            />
          </button>
          <button>
            <SkipBack
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                }
              }}
            />
          </button>
          <button onClick={handlePlayPause}>
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button>
            <SkipForward
              onClick={() => {
                if (queue.length > 0) {
                  const nextSong = queue.shift();
                  setSong(nextSong!);
                  setQueue(queue);
                  setIsPlaying(true);
                }
              }}
            />
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

      <div className={styles.volume}>
        {/* <MicVocal
          size={20}
          strokeWidth={2}
          style={{
            cursor: "pointer",
          }}
          color={
            window.location.search.includes("view=lyrics")
              ? "#ffd000"
              : "rgba(255, 255, 255, 0.8)"
          }
          onClick={() => {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get("view") === "lyrics") {
              searchParams.delete("view");
              window.history.pushState(
                {},
                "",
                `${window.location.pathname}?${searchParams.toString()}`
              );
              setUrl(window.location.search);
              return;
            }

            urlHistoryHandler("view", "lyrics", setUrl);
          }}
        /> */}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="rgba(255, 255, 255, 0.8)"
          width="24px"
          height="24px"
        >
          <path d="M7 9v6h4l5 5V4l-5 5H7z" />
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          defaultValue="1"
          onChange={(event) => {
            const audio = audioRef.current;
            if (audio) {
              audio.volume = parseFloat(event.target.value);
            }
          }}
        />
      </div>

      <audio ref={audioRef} autoPlay src={file} loop={isRepeating}></audio>
    </div>
  );
};

export default Player;
