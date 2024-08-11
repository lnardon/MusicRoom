import React from "react";
import styles from "./styles.module.css";

const ArtistProfile: React.FC = () => {
  const artist = "Artist Name";

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
          <div className={styles.album}>
            <img
              src="https://via.placeholder.com/150"
              alt="Album"
              className={styles.cover}
            />
            <span className={styles.title}>Album Title</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;
