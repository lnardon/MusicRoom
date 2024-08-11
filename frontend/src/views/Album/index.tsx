import { useState, useEffect } from "react";
import { usePlayerStore } from "../../stores/playerStore";

import styles from "./styles.module.css";

const Album: React.FC = () => {
  const [name, setName] = useState("The Off-Season");
  const [tracks, setTracks] = useState([
    {
      title: "95 South",
      album: "The Off-Season",
      duration: "3:12",
    },
    {
      title: "Amari",
      album: "The Off-Season",
      duration: "2:28",
    },
    {
      title: "My Life",
      album: "The Off-Season",
      duration: "3:38",
    },
    {
      title: "Applying Pressure",
      album: "The Off-Season",
      duration: "2:57",
    },
    {
      title: "Punchin' the Clock",
      album: "The Off-Season",
      duration: "2:57",
    },
    {
      title: "100 Mil",
      album: "The Off-Season",
      duration: "2:45",
    },
    {
      title: "Pride is the Devil",
      album: "The Off-Season",
      duration: "3:38",
    },
    {
      title: "Let Go My Hand",
      album: "The Off-Season",
      duration: "4:35",
    },
    {
      title: "Interlude",
      album: "The Off-Season",
      duration: "1:55",
    },
    {
      title: "The Climb Back",
      album: "The Off-Season",
      duration: "5:06",
    },
    {
      title: "Close",
      album: "The Off-Season",
      duration: "3:21",
    },
  ]);
  const { setFilePath, setTitle, setArtist, setCover, setIsPlaying } =
    usePlayerStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handlePlay(track: any) {
    console.log(track);
    setFilePath(`/getSong?file=${track.title}`);
    setTitle(track.title);
    setArtist("J.Cole");
    setCover(`/getCover?file=${track.title}`);
    setIsPlaying(true);
  }

  useEffect(() => {
    document.title = "Album - The Off-Season";
    fetch("/getAlbum?album=The Off-Season")
      .then((res) => res.json())
      .then((data) => {
        setName(data.name);
        setTracks(data.tracks);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.64)",
        }}
      >
        <img
          className={styles.cover}
          src={`/getCover/getCover?file=${tracks[0].title}`}
          alt="cover image"
        />
        <div className={styles.headerText}>
          <h1 className={styles.name}>{name}</h1>
          <h2 className={styles.artist}>
            <span
              style={{
                fontSize: "0.8rem",
                fontStyle: "italic",
                marginRight: "0.5rem",
              }}
            >
              by
            </span>
            <span>J.Cole</span>
          </h2>
        </div>
      </div>

      <div className={styles.tracklist}>
        <h3>Tracks</h3>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            width: "100%",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {tracks.map((track, index) => (
            <div
              className={styles.track}
              key={index}
              onClick={() => handlePlay(track)}
            >
              <span>{index + 1}</span>
              <span className={styles.title}>{track.title}</span>
              <span>{track.album}</span>
              <span className={styles.duration}>{track.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Album;
