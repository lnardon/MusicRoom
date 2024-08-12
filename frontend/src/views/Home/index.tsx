/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

import { useUrlStore } from "../../stores/urlStore";

const Home: React.FC = () => {
  const [artists, setArtists] = useState([]);
  const setUrl = useUrlStore((state) => state.setUrl);

  function handleClick(name: string) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("artist", name);
    searchParams.set("view", "artist_profile");
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );
    setUrl(window.location.search);
  }

  useEffect(() => {
    fetch("/getAllArtists")
      .then((res) => res.json())
      .then((data) => {
        setArtists(data);
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
      {/* <Album /> */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        {artists?.map((artist: any) => (
          <div
            key={artist}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              height: "100px",
              width: "200px",
              border: "1px solid black",
              marginBottom: "10px",
              fontSize: "0.8rem",
              fontWeight: "400",
            }}
            onClick={() => handleClick(artist)}
          >
            <h1>{artist}</h1>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
