/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

import { usePlayerStore } from "../../stores/playerStore";
import { useUrlStore } from "../../stores/urlStore";

import styles from "./styles.module.css";
import AnimatedText from "animated-text-letters";

const Home: React.FC = () => {
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [lastAlbums, setLastAlbums] = useState([]);

  function handleClick(track: any) {
    usePlayerStore.getState().setSong({
      title: track.title,
      artist: track.artist,
      cover: `/getCover?file=${track.album}`,
      file: `/getSong?file=${track.id}`,
    });
    usePlayerStore.getState().setIsPlaying(true);
  }

  useEffect(() => {
    fetch("/getHistory")
      .then((res) => res.json())
      .then((data) => {
        setRecentlyPlayed(data.songs);
        setLastAlbums(data.albums.slice(0, 8));
      });
  }, []);

  return (
    <div
      style={{
        width: "100%",
        overflowY: "scroll",
        height: "calc(100vh - 6rem)",
      }}
    >
      <h1 className={styles.title}>
        <AnimatedText
          text="Home"
          animation="fade-in"
          delay={64}
          easing="ease"
          transitionOnlyDifferentLetters={true}
          animationDuration={800}
        />
      </h1>
      <div
        style={{
          marginBottom: "1rem",
        }}
      >
        <h3
          style={{
            textAlign: "start",
            color: "white",
            fontSize: "1rem",
            fontWeight: "600",
            padding: "1rem 2rem 0rem 2rem",
          }}
        >
          Last Albums:
        </h3>

        <div className={styles.albums}>
          {lastAlbums.map((album: any, index: number) => (
            <div
              className={styles.album}
              key={album}
              style={{
                animationDelay: `${index * 0.08}s`,
              }}
              onClick={() => {
                const searchParams = new URLSearchParams(
                  window.location.search
                );
                searchParams.set("album", album.id);
                searchParams.set("view", "album");
                window.history.pushState(
                  {},
                  "",
                  `${window.location.pathname}?${searchParams.toString()}`
                );
                useUrlStore.getState().setUrl(window.location.search);
              }}
            >
              <img
                src={`/getCover?file=${album.id}`}
                alt=""
                style={{
                  width: "100%",
                  borderRadius: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              />
              <p
                style={{
                  textAlign: "left",
                  fontWeight: "600",
                }}
              >
                {album.title}
              </p>
            </div>
          ))}
        </div>
      </div>
      <h4
        style={{
          textAlign: "start",
          color: "white",
          fontSize: "1rem",
          fontWeight: "600",
          padding: "1rem 2rem 0rem 2rem",
        }}
      >
        Recently Played:
      </h4>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: "1rem 2rem",
          width: "100%",
        }}
      >
        {recentlyPlayed?.map((track: any, index: number) => (
          <div
            key={track}
            style={{
              backgroundColor:
                index % 2 === 0
                  ? "rgba(23, 23, 23, 1)"
                  : "rgba(23, 23, 23, 0.44)",
            }}
            className={styles.track}
            onClick={() => handleClick(track)}
          >
            <img
              src={`/getCover?file=${track.album}`}
              alt=""
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "0.25rem",
                marginRight: "1rem",
              }}
            />
            <p
              style={{
                textAlign: "left",
              }}
            >
              {track.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
