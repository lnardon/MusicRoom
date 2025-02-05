/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import AnimatedText from "animated-text-letters";
import { useUrlStore } from "../../stores/urlStore";
import { usePlayerStore } from "../../stores/playerStore";
import { apiHandler } from "../../utils/apiHandler";
import AlbumCard from "../../Components/AlbumCard";
import SongTableCell from "../../Components/SongTableCell";
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
    apiHandler(`/api/getArtist?artist=${artist}`, "GET").then((res) => {
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
          <button>All songs</button>
        </div>
        {info.songs.map((song: any, index: any) => (
          <SongTableCell
           index={index}
           track={song}
           handleClick={() => {
            setSong({
              id: song.id,
              title: song.title,
              artist: {
                id: artist || "",
                name: info.name,
              },
              cover: `/api/getCover?file=${song.album.id}`,
              file: `/api/getSong?file=${song.id}`,
            });
            setIsPlaying(true);
          }}
          />
        ))}
      </div>

      <div className={styles.albums}>
        <h3>Albums</h3>
        <div className={styles.albumsContainer}>
          {info.albums.map((album: any, index: any) => (
            <AlbumCard
              album={album}
              index={index}
              onClick={() => {
                handleClick(album.id);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;
