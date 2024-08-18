/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { usePlayerStore } from "../../stores/playerStore";
import { useUrlStore } from "../../stores/urlStore";
import { Track } from "../../types";
import styles from "./styles.module.css";
import AnimatedText from "animated-text-letters";

const Album: React.FC = () => {
  const albumId =
    new URLSearchParams(window.location.search).get("album") || "";
  const [artist, setArtist] = useState({ id: "", name: "" });
  const artistId = new URLSearchParams(window.location.search).get("artist");
  const [albumName, setAlbumName] = useState("");
  const [cover, setCover] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);

  const { setSong, setIsPlaying, setQueue, isShuffled, song, freq1, freq2 } =
    usePlayerStore();
  const setUrl = useUrlStore((state) => state.setUrl);

  const coverRef = useRef<HTMLImageElement>(null);

  const lerp = (a: number, b: number, t: number) => a + t * (b - a);

  function handlePlay(track: Track) {
    const newQueue = isShuffled
      ? [...tracks]
          .sort(() => Math.random() - 0.5)
          .map((t) => ({
            title: t.title,
            artist: {
              id: "",
              name: "",
            },
            cover: `/getCover?file=${albumId}`,
            file: `/getSong?file=${t.id}`,
          }))
      : tracks
          .slice(tracks.findIndex((t) => t.title === track.title) + 1)
          .map((t) => ({
            title: t.title,
            artist: {
              id: "",
              name: "",
            },
            cover: `/getCover?file=${albumId}`,
            file: `/getSong?file=${t.id}`,
          }));

    setQueue(newQueue);
    setSong({
      title: track.title,
      artist: artist,
      cover: `/getCover?file=${albumId}`,
      file: `/getSong?file=${track.id}`,
    });
    setIsPlaying(true);
  }

  useEffect(() => {
    document.title = albumName || "Album";
    fetch(`/getAlbum?album=${encodeURI(albumId)}`)
      .then((res) => res.json())
      .then((data) => {
        setArtist(data.artist);
        setCover(`/getCover?file=${albumId}`);
        setTracks(data.songs);
        setAlbumName(data.title);
      });
  }, [albumId, albumName, setCover, setTracks]);

  function cubicEase(x = 0) {
    return x < 0.6 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          ref={coverRef}
          style={{
            filter: `grayscale(${
              lerp(0, 1, Math.sin(freq2 / 255) * 2.25) * 16
            }%)`,
            boxShadow: `0 0 ${lerp(0, 1, Math.sin(freq2 / 255)) * 2.25}rem ${
              Math.sin(freq2 / 255) * 0.75
            }rem rgba(222, 222, 222, ${
              lerp(0, 1, Math.sin(freq2 / 255)) * 0.32
            })`,
            border: `${
              cubicEase(lerp(0, 1, Math.sin(freq2 / 255))) * 0.2
            }rem solid rgba(255, 255, 255, ${
              lerp(0, 1, Math.sin(freq1 / 255)) * 1
            })`,
          }}
          className={styles.cover}
          src={cover}
          alt="cover image"
        />
        <div className={styles.headerText}>
          <h1 className={styles.name}>
            <AnimatedText
              text={albumName}
              easing="ease-in-out"
              delay={28}
              animationDuration={400}
              animation="slide-up"
              transitionOnlyDifferentLetters={true}
            />
          </h1>
          <h2 className={styles.artist}>
            <span className={styles.artistNameDetail}>by</span>
            <span
              className={styles.artistName}
              onClick={() => {
                const searchParams = new URLSearchParams(
                  window.location.search
                );
                searchParams.set("artist", artistId || "");
                searchParams.set("view", "artist_profile");
                window.history.pushState(
                  {},
                  "",
                  `${window.location.pathname}?${searchParams.toString()}`
                );
                setUrl(window.location.search);
              }}
            >
              {artist.name}
            </span>
          </h2>
        </div>
      </div>
      <div className={styles.tracklist}>
        <h3>Tracks</h3>
        <div className={styles.tracksContainer}>
          {tracks.map((track, index) => (
            <div
              className={styles.track}
              key={index}
              onClick={() => handlePlay(track)}
              style={{
                color: song.title === track.title ? "#ffd000" : "white",
                fontWeight: song.title === track.title ? "bold" : "normal",
                background:
                  index % 2 === 0
                    ? "rgba(0, 0, 0, 0.32)"
                    : "rgba(0, 0, 0, 0.08)",
              }}
            >
              <span style={{ width: "1.5rem", flex: "none" }}>{index + 1}</span>
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
