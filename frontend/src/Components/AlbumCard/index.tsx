import { Album } from "../../types";
import { HandleFallbackImage } from "../../utils/helpers";
import styles from "./styles.module.css";

const AlbumCard = ({
  album,
  onClick,
  index,
}: {
  album: Album;
  onClick: () => void;
  index: number;
}) => {
  return (
    <div
      className={styles.container}
      key={album.id}
      style={{
        animationDelay: `${index * 0.08}s`,
      }}
      onClick={onClick}
    >
      {HandleFallbackImage(`/api/getCover?file=${album.id}`, "", null, {
        width: "100%",
        height: "max-content",
        borderRadius: "0.25rem",
        marginBottom: "0.5rem",
      })}
      <p className={styles.title}>{album.title}</p>
    </div>
  );
};

export default AlbumCard;
