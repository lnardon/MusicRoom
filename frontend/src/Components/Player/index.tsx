import { useState, useRef, useEffect } from "react";
import AnimatedText from "animated-text-letters";
import { Play, Pause, Repeat2, Dices } from "lucide-react";
import "animated-text-letters/index.css";
import styles from "./styles.module.css";

type PlayerProps = {
  filePath: string;
  title: string;
  artist: string;
  cover: string;
};

const Player: React.FC<PlayerProps> = ({ filePath, title, artist, cover }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
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

  return (
    <div className={styles.container}>
      <div className={styles.trackInfo}>
        {cover !== "" && (
          <img src={cover} alt={title} className={styles.cover} />
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
          <span className={styles.artist}>
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
            <Repeat2 />
          </button>
          <button>Prev</button>
          <button onClick={handlePlayPause}>
            {isPlaying ? <Pause /> : <Play />}
          </button>
          <button>Next</button>
          <button>
            <Dices />
          </button>
        </div>

        <div className={styles.timeline} onClick={handleTimelineClick}>
          <div className={styles.progress} style={{ width: `${progress}%` }}>
            <div className={styles.bar}>
              <div
                className={styles.fill}
                style={{
                  width: `${progress}%`,
                }}
              >
                <div className={styles.handle}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} autoPlay src={filePath}></audio>
    </div>
  );
};

export default Player;
