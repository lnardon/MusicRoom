/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

import { usePlayerStore } from "../../stores/playerStore";

const Home: React.FC = () => {
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  function handleClick(track: any) {
    usePlayerStore.getState().setFilePath(`/getSong?file=${track.id}`);
    usePlayerStore.getState().setTitle(track.title);
    usePlayerStore.getState().setArtist(track.artist);
    usePlayerStore.getState().setCover(`/getCover?file=${track.album}`);
    usePlayerStore.getState().setIsPlaying(true);
  }

  useEffect(() => {
    fetch("/getHistory")
      .then((res) => res.json())
      .then((data) => {
        setRecentlyPlayed(data);
      });
  }, []);

  return (
    <div
      style={{
        width: "100%",
        overflowY: "scroll",
        height: "calc(100vh - 6rem)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: "20px",
          width: "100%",
        }}
      >
        {recentlyPlayed?.map((track: any) => (
          <div
            key={track}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              marginBottom: "1rem",
              fontSize: "1rem",
              fontWeight: "400",
              cursor: "pointer",
            }}
            onClick={() => handleClick(track)}
          >
            <img
              src={`/getCover?file=${track.album}`}
              alt=""
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "0.25rem",
                marginRight: "1rem",
              }}
            />
            <p
              style={{
                textAlign: "left",
              }}
            >
              {track.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
