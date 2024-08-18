/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import AnimatedText from "animated-text-letters";
import { useUrlStore } from "../../stores/urlStore";
import { usePlayerStore } from "../../stores/playerStore";
import styles from "./styles.module.css";

const ArtistProfile: React.FC = () => {
  const setUrl = useUrlStore((state) => state.setUrl);
  const { setSong, setIsPlaying } = usePlayerStore();

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
    fetch(`/getArtist?artist=${artist}`).then((res) => {
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
        <h3>Tracks</h3>
        {info.songs.map((song: any, index: any) => (
          <div
            className={styles.song}
            key={index}
            style={{
              animationDelay: `${index * 0.08}s`,
              background:
                index % 2 === 0 ? "rgba(0, 0, 0, 0.32)" : "rgba(0, 0, 0, 0.08)",
            }}
            onClick={() => {
              setSong({
                title: song.title,
                artist: {
                  id: artist || "",
                  name: info.name,
                },
                cover: `/getCover?file=${
                  (
                    info.albums.filter(
                      (album: any) => album.title === song.album
                    )[0] as { id: string }
                  ).id
                }`,
                file: `/getSong?file=${song.id}`,
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
              <img
                src={`/getCover?file=${
                  (
                    info.albums.filter(
                      (album: any) => album.title === song.album
                    )[0] as { id: string }
                  ).id
                }`}
                alt="cover image"
                className={styles.songCover}
              />
              <h4 className={styles.title}>{song.title}</h4>
            </div>
            <h4 className={styles.duration}>{song.duration}</h4>
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
              <img
                src={`/getCover?file=${encodeURI(album.id)}`}
                alt="cover image"
                className={styles.cover}
              />
              <h4>{album.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;
