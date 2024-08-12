/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useUrlStore } from "../../stores/urlStore";

import styles from "./styles.module.css";

const ArtistProfile: React.FC = () => {
  const setUrl = useUrlStore((state) => state.setUrl);
  const artist = new URLSearchParams(window.location.search).get("artist");
  const [info, setInfo] = useState({
    artist: "",
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
          }}
        >
          {info.albums.map((album: any, index: any) => (
            <div
              className={styles.album}
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100px",
                width: "200px",
                margin: "0.5rem",
                backgroundColor: "rgba(0, 0, 0, 0.64)",
              }}
              onClick={() => {
                handleClick(album);
              }}
            >
              <img
                src={`/getCover?file=${album}`}
                alt="cover image"
                style={{
                  height: "100px",
                  width: "100px",
                }}
              />
              <h4>{album}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;
