import { Track } from "../../types";
import { HandleFallbackImage } from "../../utils/helpers";
import { useHandleOpenArtist } from "../../utils/hooks";
// import OptionsMenu from "../OptionsMenu";
import { usePlayerStore } from "../../stores/playerStore"
import styles from "./styles.module.css";

const SongTableCell = ({
  track,
  index,
  handleClick,
  hideCover = false
}: {
  track: Track;
  index: number;
  handleClick: (track: Track) => void;
  hideCover?: boolean
}) => {
  const song = usePlayerStore(state => state.song);

  const handleOpenArtist = useHandleOpenArtist()

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
      <div style={{
        display: "flex",
        flexDirection: "row"
      }}>
        {hideCover ? null : HandleFallbackImage(`/api/getCover?file=${track.album.id}`, "", null, {
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
            handleOpenArtist(track.artist)
          }}>{track.artist.name}</p>
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <p className={styles.duration}>{track.duration}</p>
        {/* <OptionsMenu trackId={track.id} /> */}
      </div>
    </div>
  );
};

export default SongTableCell;
