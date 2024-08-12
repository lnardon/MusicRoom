import { useState, useEffect } from "react";
import { usePlayerStore } from "../../stores/playerStore";
import { useUrlStore } from "../../stores/urlStore";

import styles from "./styles.module.css";

const Album: React.FC = () => {
  const [name, setName] = useState(
    new URLSearchParams(window.location.search).get("album")
  );
  const [artist, setArtist2] = useState(
    new URLSearchParams(window.location.search).get("artist")
  );
  const [cover, setCover2] = useState("");
  const [tracks, setTracks] = useState([
    {
      title: "State of the Art",
      cover: "",
      album: "Sleep Is the Cousin of Death",
      duration: "2:45",
    },
  ]);
  const { setFilePath, setTitle, setCover, setArtist, setIsPlaying } =
    usePlayerStore();
  const setUrl = useUrlStore((state) => state.setUrl);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handlePlay(track: any) {
    setFilePath(
      `/getSong?file=/media/lucas/HDD1/Music/${artist?.split("/")[0]}/${name}/${
        track.title
      }.mp3`
    );
    setTitle(track.title);
    setArtist(artist || "");
    setCover(
      `/getCover?file=/media/lucas/HDD1/Music/${
        artist?.split("/")[0]
      }/${name}/${track.title}.mp3`
    );
    setIsPlaying(true);
  }

  useEffect(() => {
    document.title = name || "Album";
    fetch(`/getAlbum?album=${name}`)
      .then((res) => res.json())
      .then((data) => {
        setName(data[0].album);
        setArtist2(data[0].artist);
        setCover2(
          `/getCover?file=/media/lucas/HDD1/Music/${
            data[0].artist.split("/")[0]
          }/${data[0].album}/${data[0].title}.mp3`
        );
        setTracks(data);
      });
  }, [name]);

  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.64)",
        }}
      >
        <img className={styles.cover} src={cover} alt="cover image" />
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
            <span
              style={{
                cursor: "pointer",
                color: "white",
                textDecoration: "underline",
              }}
              onClick={() => {
                const searchParams = new URLSearchParams(
                  window.location.search
                );
                searchParams.set("artist", artist || "");
                searchParams.set("view", "artist_profile");
                window.history.pushState(
                  {},
                  "",
                  `${window.location.pathname}?${searchParams.toString()}`
                );
                setUrl(window.location.search);
              }}
            >
              {artist}
            </span>
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
              <span
                style={{
                  width: "2rem",
                }}
              >
                {index + 1}
              </span>
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
