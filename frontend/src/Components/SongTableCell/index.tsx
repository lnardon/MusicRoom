import { Track } from "../../types";
import { HandleFallbackImage } from "../../utils/helpers";
import OptionsMenu from "../OptionsMenu";
import { usePlayerStore } from "../../stores/playerStore"
import styles from "./styles.module.css";
import { useUrlStore } from "../../stores/urlStore";

const SongTableCell = ({
  track,
  index,
  handleClick,
}: {
  track: Track;
  index: number;
  handleClick: (track: Track) => void;
}) => {
  const song = usePlayerStore(state => state.song);
  const setUrl = useUrlStore((state) => state.setUrl);

  function handleArtistClick(artist: string) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("artist", artist);
    searchParams.set("view", "artist_profile");
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );
    setUrl(window.location.search);
  }

  return (
    <div
      key={track.id}
      style={{
        color: `${song.id === track.id ? "var(--yellow-primary)" : "#fff"}`,
        animationDelay: `${index * 0.08}s`,
      }}
      className={styles.container}
      onClick={() => handleClick(track)}
      onContextMenu={() => { }}
    >
      {HandleFallbackImage(`/getCover?file=${track.album}`, "", null, {
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "0.25rem",
        marginRight: "0.5rem",
      })}
      <div className={styles.textContainer}>
        <p className={styles.title}>{track.title}</p>
        <p className={styles.artist} onClick={ e => {
          e.preventDefault();
          e.stopPropagation();
          handleArtistClick(track.artist.id)
        }}>{track.artist.name}</p>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <OptionsMenu trackId={track.id} />
      </div>
    </div>
  );
};

export default SongTableCell;
