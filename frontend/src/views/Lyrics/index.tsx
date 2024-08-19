import React, { useState, useEffect, useRef } from "react";
import styles from "./styles.module.css";
import { usePlayerStore } from "../../stores/playerStore";

type LyricsLine = {
  time: number;
  text: string;
};

const lyrics: LyricsLine[] = [
  { time: 0, text: "Hello, it's me" },
  {
    time: 3,
    text: "I was wondering if after all these years you'd like to meet",
  },
  {
    time: 6,
    text: "To go over everything",
  },
  { time: 12, text: "To go over everything" },
  { time: 18, text: "They say that time's supposed to heal ya" },
  { time: 24, text: "But I ain't done much healing" },
  { time: 28, text: "Hello, can you hear me?" },
  { time: 32, text: "I'm in California dreaming about who we used to be" },
  { time: 35, text: "When we were younger and free" },
  {
    time: 38,
    text: "I've forgotten how it felt before the world fell at our feet",
  },
  { time: 42, text: "There's such a difference between us" },
  { time: 46, text: "And a million miles" },
  { time: 50, text: "Hello from the other side" },
  { time: 54, text: "I must've called a thousand times" },
  { time: 58, text: "To tell you I'm sorry for everything that I've done" },
  { time: 61, text: "But when I call, you never seem to be home" },
  { time: 66, text: "Hello from the outside" },
  { time: 70, text: "At least I can say that I've tried" },
  { time: 74, text: "To tell you I'm sorry for breaking your heart" },
  {
    time: 78,
    text: "But it don't matter, it clearly doesn't tear you apart anymore",
  },
  { time: 83, text: "Hello, how are you?" },
  { time: 86, text: "It's so typical of me to talk about myself, I'm sorry" },
  { time: 90, text: "I hope that you're well" },
  {
    time: 93,
    text: "Did you ever make it out of that town where nothing ever happened?",
  },
  {
    time: 97,
    text: "It's no secret that the both of us are running out of time",
  },
  { time: 102, text: "So hello from the other side" },
  { time: 106, text: "I must've called a thousand times" },
  { time: 110, text: "To tell you I'm sorry for everything that I've done" },
  { time: 114, text: "But when I call, you never seem to be home" },
  { time: 118, text: "Hello from the outside" },
  { time: 122, text: "At least I can say that I've tried" },
  { time: 126, text: "To tell you I'm sorry for breaking your heart" },
  { time: 130, text: "But it don't matter" },
];

const LyricsComponent: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLine, setCurrentLine] = useState<LyricsLine>({} as LyricsLine);
  const [pastLines, setPastLines] = useState<LyricsLine[]>([]);

  const { audioRef } = usePlayerStore();
  const containerRef = useRef<HTMLDivElement>(null);

  function handleLineClick(time: number) {
    audioRef!.currentTime = time;
  }

  useEffect(() => {
    if (!audioRef) return;
    audioRef.addEventListener("timeupdate", () => {
      setCurrentTime(audioRef.currentTime || 0);
    });

    const line = lyrics.find(
      (line) =>
        line.time <= currentTime &&
        (!lyrics[lyrics.indexOf(line) + 1] ||
          lyrics[lyrics.indexOf(line) + 1].time > currentTime)
    );
    if (line && line.text !== currentLine.text) {
      setCurrentLine(line);
      setPastLines([...lyrics.filter((l) => l.time < line.time)]);
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [currentTime]);

  return (
    <div className={styles.container} ref={containerRef}>
      {pastLines.map((line, index) => (
        <p
          key={index}
          className={styles.line}
          style={{
            opacity: 0.2,
          }}
          onClick={() => handleLineClick(line.time)}
        >
          {line.text}
        </p>
      ))}
      <p
        style={{
          marginBottom: "8rem",
        }}
        className={styles.line + " " + styles.animated}
        onClick={() => handleLineClick(currentLine.time)}
      >
        {currentLine.text}
      </p>
    </div>
  );
};

export default LyricsComponent;
