/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useUrlStore } from "../../stores/urlStore";
import { usePlayerStore } from "../../stores/playerStore";

import styles from "./styles.module.css";
import AnimatedText from "animated-text-letters";
import { PlayIcon } from "lucide-react";
import { HandleFallbackImage } from "../../utils/helpers";

const Stats: React.FC = () => {
  const setUrl = useUrlStore((state) => state.setUrl);
  const { setSong, setIsPlaying } = usePlayerStore();
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    fetch(`/api/getStats`).then((res) => {
      res.json().then((data) => {
        setStats(data);
      });
    });
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <AnimatedText
          text="Stats"
          animation="fade-in"
          delay={64}
          easing="ease-in-out"
          transitionOnlyDifferentLetters={true}
          animationDuration={600}
        />
      </h1>
      <p
        style={{
          marginBottom: "2rem",
          fontSize: "1rem",
          fontWeight: 300,
        }}
      >
        {stats.all_info}
      </p>
      <div className={styles.statsContainer}>
        <div className={styles.topStats}>
          <div className={styles.stat}>
            <h2>Top 5 Artists</h2>
            <div className={styles.list}>
              {stats.artists &&
                stats.artists.map((artist: any, index: any) => (
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      cursor: "pointer",
                      animationDelay: `${index * 0.08}s`,
                    }}
                    onClick={() => {
                      const searchParams = new URLSearchParams(
                        window.location.search
                      );
                      searchParams.set("artist", artist.id || "");
                      searchParams.set("view", "artist_profile");
                      window.history.pushState(
                        {},
                        "",
                        `${window.location.pathname}?${searchParams.toString()}`
                      );
                      setUrl(window.location.search);
                    }}
                  >
                    <p
                      style={{
                        textAlign: "left",
                      }}
                      key={index}
                    >
                      {index + 1}. {artist.name}
                    </p>
                  </div>
                ))}
            </div>
          </div>
          <div className={styles.stat}>
            <h2>Albums</h2>
            <div className={styles.list}>
              {stats.albums &&
                stats.albums.map((album: any, index: any) => (
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      cursor: "pointer",
                      animationDelay: `${index * 0.04}s`,
                    }}
                    onClick={() => {
                      const searchParams = new URLSearchParams(
                        window.location.search
                      );
                      searchParams.set("album", album.id || "");
                      searchParams.set("view", "album");
                      window.history.pushState(
                        {},
                        "",
                        `${window.location.pathname}?${searchParams.toString()}`
                      );
                      setUrl(window.location.search);
                    }}
                  >
                    {HandleFallbackImage(
                      `/api/getCover?file=${album.id}`,
                      styles.albumCover,
                      null,
                      {
                        width: "1.25rem",
                        height: "1.25rem",
                        borderRadius: "0.25rem",
                        marginRight: "0.5rem",
                      }
                    )}
                    <p
                      style={{
                        textAlign: "left",
                      }}
                      key={index}
                    >
                      {album.title}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className={styles.stat}>
          <h2>Songs</h2>
          <div className={styles.list}>
            {stats.songs &&
              stats.songs.map((song: any, index: any) => (
                <div
                  className={styles.song}
                  style={{
                    animationDelay: `${index * 64}ms`,
                  }}
                  onClick={() => {
                    setSong({
                      title: song.title,
                      artist: song.artist,
                      cover: `/api/getCover?file=${song.album.id}`,
                      file: `/api/getSong?file=${song.id}`,
                    });
                    setIsPlaying(true);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    {HandleFallbackImage(
                      `/api/getCover?file=${song.album.id}`,
                      styles.songCover,
                      null,
                      {
                        width: "1.25rem",
                        height: "1.25rem",
                        borderRadius: "0.25rem",
                        marginRight: "0.5rem",
                      }
                    )}
                    <p
                      style={{
                        textAlign: "left",
                      }}
                      key={index}
                    >
                      {song.title}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      fontSize: "0.8rem",
                    }}
                  >
                    <p>{song.plays}</p>
                    <PlayIcon
                      size={10}
                      style={{
                        marginLeft: "0.25rem",
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
