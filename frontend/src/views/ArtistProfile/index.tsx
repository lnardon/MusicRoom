import { useEffect, useState } from "react";
import AnimatedText from "animated-text-letters";
import { apiHandler } from "../../utils/apiHandler";
import AlbumCard from "../../Components/AlbumCard";
import SongTableCell from "../../Components/SongTableCell";
import { useHandlePlaySong, useHandleOpenAlbum } from "../../utils/hooks";
import { Album, Track } from "../../types";
import styles from "./styles.module.css";

const ArtistProfile: React.FC = () => {
  const artist = new URLSearchParams(window.location.search).get("artist");
  const [info, setInfo] = useState({
    name: "",
    albums: [],
    songs: [],
  });

  const handlePlaySong = useHandlePlaySong()
  const handleOpenAlbum = useHandleOpenAlbum()

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
        {info.songs.map((song: Track, index: number) => (
          <SongTableCell
           index={index}
           track={song}
           handleClick={() => handlePlaySong(song)}
          />
        ))}
      </div>

      <div className={styles.albums}>
        <h3>Albums</h3>
        <div className={styles.albumsContainer}>
          {info.albums.map((album: Album, index: number) => (
            <AlbumCard
              album={album}
              index={index}
              onClick={() => {
                handleOpenAlbum(album);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;
