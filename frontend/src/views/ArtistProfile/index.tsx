/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useUrlStore } from "../../stores/urlStore";

import styles from "./styles.module.css";
import AnimatedText from "animated-text-letters";

const ArtistProfile: React.FC = () => {
  const setUrl = useUrlStore((state) => state.setUrl);
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
    document.title = artist || "Artist Profile";
    fetch(`/getArtist?artist=${artist}`).then((res) => {
      res.json().then((data) => {
        setInfo(data);
      });
    });
  }, [artist]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.name}>
          <AnimatedText
            text={artist || ""}
            easing="ease"
            delay={16}
            animationDuration={600}
            animation="fade-in"
            transitionOnlyDifferentLetters={true}
          />
        </h1>
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
                handleClick(album.title);
              }}
            >
              <img
                src={`/getCover?file=${encodeURI(album.title)}`}
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
