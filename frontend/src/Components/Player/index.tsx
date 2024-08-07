import styles from "./styles.module.css";

const Player = ({
  filePath,
  title,
  artist,
  cover,
}: {
  filePath: string;
  title: string;
  artist: string;
  cover: string;
}) => {
  return (
    <div className={styles.container}>
      <h1>Music Player</h1>
      <h2>{title}</h2>
      <h3>{artist}</h3>
      <img src={cover} alt="cover" />
      <audio autoPlay controls src={filePath}></audio>
    </div>
  );
};

export default Player;
