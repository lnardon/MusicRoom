import { useState, useEffect } from "react";
import AlbumCard from "@/components/AlbumCard";
import SongTableCell from "../../Components/SongTableCell";
import { Track, Album } from "../../types";
import { apiHandler } from "../../utils/apiHandler";
import styles from "./styles.module.css";
import { useHandleOpenAlbum, useHandlePlaySong } from "../../utils/hooks";
import AlbumCardSkeleton from "@/components/AlbumCardSkeleton";
import SongTableCellSkeleton from "@/components/SongTableCellSkeleton";

const Home: React.FC = () => {
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [lastAlbums, setLastAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  const handlePlaySong = useHandlePlaySong();
  const handleOpenAlbum = useHandleOpenAlbum();

  useEffect(() => {
    setLoading(true);
    apiHandler("/api/getHistory", "GET")
      .then((res) => res.json())
      .then((data) => {
        setRecentlyPlayed(data.songs);
        setLastAlbums(data.albums);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.albumsContainer}>
        <h3 className={styles.subtitle}>Last Albums:</h3>
        <div className={styles.albums}>
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <AlbumCardSkeleton key={index} index={index} />
              ))
            : lastAlbums.map((album: Album, index: number) => (
                <AlbumCard
                  key={album.id}
                  onClick={() => handleOpenAlbum(album)}
                  album={album}
                  index={index}
                />
              ))}
        </div>
      </div>

      <h4 className={styles.subtitle}>Recently Played:</h4>
      <div className={styles.tracksContainer}>
        {loading
          ? Array.from({ length: 10 }).map((_, index) => (
             <SongTableCellSkeleton key={index} index={index} />
            ))
          : recentlyPlayed?.map((track: Track, index: number) => (
              <SongTableCell
                key={track.id}
                track={track}
                index={index}
                handleClick={handlePlaySong}
              />
            ))}
      </div>
    </div>
  );
};

export default Home;
