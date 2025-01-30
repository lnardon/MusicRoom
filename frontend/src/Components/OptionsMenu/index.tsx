/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styles from "./styles.module.css";
import { Ellipsis } from "lucide-react";

const OptionsMenu = ({ trackId }: { trackId: string }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  function fetchPlaylists() {
    fetch("/api/getAllPlaylists")
      .then((res) => res.json())
      .then((data) => {
        setPlaylists(data);
      });
  }

  function handleAddToPlaylist(playlist_id: string) {
    fetch("/api/addSongToPlaylist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playlist_id,
        song_id: trackId,
      }),
    }).then((res) => {
      if (res.status === 200) {
        alert("Song added to Black Crow!");
      }
    });
  }

  useEffect(() => {
    if (isDropdownOpen) {
      fetchPlaylists();
    }

    document.addEventListener("click", (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    });

    return () => {
      document.removeEventListener("click", () => setIsDropdownOpen(false));
    };
  }, [isDropdownOpen]);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const { clientX, clientY } = event;
    setIsDropdownOpen((current) => {
      if (!current) {
        setTimeout(() => {
          if (dropdownRef.current) {
            const dropdownWidth = dropdownRef.current.offsetWidth;
            const newX = clientX - dropdownWidth;
            setPosition({ x: newX, y: clientY });
          }
        }, 64); // Timeout to allow for the dropdown to render and calculate dimensions
      }
      return !current;
    });
  };

  const dropdownMenu = (
    <div
      ref={dropdownRef}
      className={styles.dropdown}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <p>Add song to:</p>
      {playlists.map((playlist: any) => (
        <div key={playlist.id} className={styles.playlist}>
          <p onClick={() => handleAddToPlaylist(playlist.id)}>
            {playlist.name}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      <button onClick={handleClick} className={styles.optionsButton}>
        <Ellipsis size={22} />
      </button>
      {isDropdownOpen &&
        playlists &&
        ReactDOM.createPortal(dropdownMenu, document.body)}
    </div>
  );
};

export default OptionsMenu;
