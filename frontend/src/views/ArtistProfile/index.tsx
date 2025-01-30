/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import AnimatedText from "animated-text-letters";
import { useUrlStore } from "../../stores/urlStore";
import { usePlayerStore } from "../../stores/playerStore";
import { HandleFallbackImage } from "../../utils/helpers";
import OptionsMenu from "../../Components/OptionsMenu";
import styles from "./styles.module.css";

const ArtistProfile: React.FC = () => {
  const setUrl = useUrlStore((state) => state.setUrl);
  const { setSong, song, setIsPlaying } = usePlayerStore();

  const artist = new URLSearchParams(window.location.search).get("artist");
  const [info, setInfo] = useState({
    name: "",
    albums: [],
    songs: [],
  });

  function handleClick(album: any) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("album", album);
    searchParams.set("view", "album");
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );
    setUrl(window.location.search);
  }

  useEffect(() => {
    document.title = info.name || "Artist Profile";
    fetch(`/api/getArtist?artist=${artist}`).then((res) => {
      res.json().then((data) => {
        setInfo(data);
      });
    });
  }, [artist, info.name]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.name}>
          <AnimatedText
            text={info.name || ""}
            easing="ease"
            delay={16}
            animationDuration={600}
            animation="fade-in"
            transitionOnlyDifferentLetters={true}
          />
        </h1>
      </div>

      <div className={styles.songs}>
        <div>
          <h3>Tracks</h3>
          <button
          >All songs</button>
        </div>
        {info.songs.map((song1: any, index: any) => (
          <div
            className={styles.song}
            key={index}
            style={{
              animationDelay: `${index * 0.08}s`,
              background:
                index % 2 === 0 ? "rgba(0, 0, 0, 0.32)" : "rgba(0, 0, 0, 0.08)",
              color: song.id === song1.id ? "#ffd000" : "white",
              fontWeight: song.id === song1.id ? "bold" : "normal",
            }}
            onClick={() => {
              setSong({
                id: song1.id,
                title: song1.title,
                artist: {
                  id: artist || "",
                  name: info.name,
                },
                cover: `/api/getCover?file=${
                  (
                    info.albums.filter(
                      (album: any) => album.title === song1.album
                    )[0] as { id: string }
                  ).id
                }`,
                file: `/api/getSong?file=${song1.id}`,
              });
              setIsPlaying(true);
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {HandleFallbackImage(
                `/api/getCover?file=${
                  (
                    info.albums.filter(
                      (album: any) => album.title === song1.album
                    )[0] as { id: string }
                  ).id
                }`,
                styles.songCover
              )}
              <h4 className={styles.title}>{song1.title}</h4>
            </div>
            <h4 className={styles.duration}>{song1.duration}</h4>
            <div
              style={{
                width: "2rem",
                position: "absolute",
                right: "0.25rem",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <OptionsMenu trackId={song1.id} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.albums}>
        <h3>Albums</h3>
        <div className={styles.albumsContainer}>
          {info.albums.map((album: any, index: any) => (
            <div
              className={styles.album}
              key={index}
              style={{
                animationDelay: `${index * 0.08}s`,
              }}
              onClick={() => {
                handleClick(album.id);
              }}
            >
              {HandleFallbackImage(
                `/api/getCover?file=${encodeURI(album.id)}`,
                styles.cover
              )}
              <h4>{album.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;
