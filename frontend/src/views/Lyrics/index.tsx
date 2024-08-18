import React, { useState, useEffect } from "react";
import { usePlayerStore } from "../../stores/playerStore";

type LyricsLine = {
  time: number; // Time in seconds when the line should appear
  text: string;
};

const lyrics: LyricsLine[] = [
  { time: 0, text: "Hello, it's me" },
  {
    time: 10,
    text: "I was wondering if after all these years you'd like to meet",
  },
  { time: 20, text: "To go over everything" },
  { time: 30, text: "They say that time's supposed to heal ya" },
  { time: 40, text: "But I ain't done much healing" },
  { time: 50, text: "Hello, can you hear me?" },
  { time: 60, text: "I'm in California dreaming about who we used to be" },
  { time: 70, text: "When we were younger and free" },
  {
    time: 80,
    text: "I've forgotten how it felt before the world fell at our feet",
  },
  { time: 90, text: "There's such a difference between us" },
  { time: 100, text: "And a million miles" },
  { time: 110, text: "Hello from the other side" },
  { time: 120, text: "I must've called a thousand times" },
  { time: 130, text: "To tell you I'm sorry for everything that I've done" },
  { time: 140, text: "But when I call, you never seem to be home" },
  { time: 150, text: "Hello from the outside" },
];

const LyricsComponent: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLine, setCurrentLine] = useState("");

  const { audioRef } = usePlayerStore();

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
    if (line && line.text !== currentLine) {
      setCurrentLine(line.text);
    }
  }, [currentTime]);

  return (
    <div>
      <p>{currentLine}</p>
    </div>
  );
};

export default LyricsComponent;
