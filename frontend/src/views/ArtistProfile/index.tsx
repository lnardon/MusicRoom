/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useUrlStore } from "../../stores/urlStore";

import styles from "./styles.module.css";

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
        setInfo({
          name: data.name,
          albums: data.albums,
          songs: data.songs,
        });
      });
    });
  }, [artist]);

  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.64)",
        }}
      >
        <h1 className={styles.name}>{artist}</h1>
      </div>

      <div className={styles.albums}>
        <h3>Albums</h3>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          {info.albums.map((album: any, index: any) => (
            <div
              className={styles.album}
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                width: "12rem",
                margin: "0.5rem",
                backgroundColor: "rgba(0, 0, 0, 0.64)",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                cursor: "pointer",
                animationDelay: `${index * 0.08}s`,
              }}
              onClick={() => {
                handleClick(album.title);
              }}
            >
              <img
                src={`/getCover?file=${encodeURI(album.title)}`}
                alt="cover image"
                style={{
                  width: "100%",
                  borderRadius: "0.5rem",
                  marginBottom: "0.5rem",
                }}
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
