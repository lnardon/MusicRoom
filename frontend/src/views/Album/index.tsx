import { useState, useEffect, useRef } from "react";
import AnimatedText from "animated-text-letters";
import { usePlayerStore } from "../../stores/playerStore";
import { useUrlStore } from "../../stores/urlStore";
import { Track } from "../../types";
import { HandleFallbackImage } from "../../utils/helpers";
import { apiHandler } from "../../utils/apiHandler";
import SongTableCell from "../../Components/SongTableCell";
import styles from "./styles.module.css";

const Album: React.FC = () => {
  const [artist, setArtist] = useState({ id: "", name: "" });
  const [albumName, setAlbumName] = useState("");
  const [cover, setCover] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);

  const { setSong, setIsPlaying, setQueue, isShuffled, freq1, freq2 } =
    usePlayerStore();
  const setUrl = useUrlStore((state) => state.setUrl);
  const coverRef = useRef<HTMLImageElement>(null);
  const albumId = new URLSearchParams(window.location.search).get("album") || "";
  const lerp = (a: number, b: number, t: number) => a + t * (b - a);

  function handlePlay(track: Track) {
    const newQueue = isShuffled
      ? [...tracks]
          .sort(() => Math.random() - 0.5)
          .map((t) => ({
            title: t.title,
            artist: artist,
            cover: `/api/getCover?file=${albumId}`,
            file: `/api/getSong?file=${t.id}`,
          }))
      : tracks
          .slice(tracks.findIndex((t) => t.title === track.title) + 1)
          .map((t) => ({
            title: t.title,
            artist: artist,
            cover: `/api/getCover?file=${albumId}`,
            file: `/api/getSong?file=${t.id}`,
          }));

    setQueue(newQueue);
    setSong({
      title: track.title,
      artist: artist,
      cover: `/api/getCover?file=${albumId}`,
      file: `/api/getSong?file=${track.id}`,
    });
    setIsPlaying(true);
  }

  useEffect(() => {
    document.title = albumName || "Album";
    apiHandler(`/api/getAlbum?album=${encodeURI(albumId)}`, "GET")
      .then((res) => res.json())
      .then((data) => {
        setArtist(data.artist);
        setCover(`/api/getCover?file=${albumId}`);
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
        {HandleFallbackImage(cover, styles.cover, coverRef, {
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
        })}
        <div className={styles.headerText}>
          <h1 className={styles.name}>
            <AnimatedText
              text={albumName}
              easing="ease-in-out"
              delay={28}
              animationDuration={400}
              animation="slide-up"
              transitionOnlyDifferentLetters={true}
              style={{
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-start",
              }}
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
                searchParams.set("artist", artist.id);
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
            <SongTableCell
            index={index}
            track={track}
            handleClick={() => handlePlay(track)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Album;
