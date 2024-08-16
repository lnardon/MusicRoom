import { useState, useEffect } from "react";
import { usePlayerStore } from "../../stores/playerStore";
import { useUrlStore } from "../../stores/urlStore";
import { Track } from "../../types";
import styles from "./styles.module.css";
import AnimatedText from "animated-text-letters";

const Album: React.FC = () => {
  const albumId =
    new URLSearchParams(window.location.search).get("album") || "";
  const [artist, setArtist] = useState(
    new URLSearchParams(window.location.search).get("artist")
  );
  const artistId = new URLSearchParams(window.location.search).get("artist");
  const [albumName, setAlbumName] = useState("");
  const [cover, setCover] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const { setSong, setIsPlaying, setQueue, isShuffled, song } =
    usePlayerStore();
  const setUrl = useUrlStore((state) => state.setUrl);

  function handlePlay(track: Track) {
    const newQueue = isShuffled
      ? [...tracks]
          .sort(() => Math.random() - 0.5)
          .map((t) => ({
            title: t.title,
            artist: artist || "",
            cover: `/getCover?file=${albumId}`,
            file: `/getSong?file=${t.id}`,
          }))
      : [...tracks]
          .splice(
            tracks.findIndex((t) => t.title === track.title) + 1,
            tracks.length
          )
          .map((t) => ({
            title: t.title,
            artist: artist || "",
            cover: `/getCover?file=${albumId}`,
            file: `/getSong?file=${t.id}`,
          }));
    setQueue(newQueue);
    setSong({
      title: track.title,
      artist: artist || "",
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
  }, [albumId, setCover, setTracks]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img className={styles.cover} src={cover} alt="cover image" />
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
              {artist}
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
              }}
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
