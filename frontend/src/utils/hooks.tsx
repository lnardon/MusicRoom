import { usePlayerStore } from "../stores/playerStore";
import { useUrlStore } from "../stores/urlStore";
import { Album, Artist, Track } from "../types";

export function urlHistoryHandler(
  key: string,
  value: string,
  setUrl: (url: string) => void
) {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(key, searchParams.get(key) === value ? "" : value);
  window.history.pushState(
    {},
    "",
    `${window.location.pathname}?${searchParams.toString()}`
  );
  setUrl(window.location.search);
}
  
export function useHandlePlaySong() {
  const { setSong, setIsPlaying } = usePlayerStore();

  return (song: Track) => {
    setSong({
      id: song.id,
      title: song.title,
      artist: song.artist,
      file: `/api/getSong?file=${song.id}`,
      cover: `/api/getCover?file=${song.album.id}`,
    });
    setIsPlaying(true);
  };
}
  
export function useHandleOpenArtist() {
  return (artist: Artist) => {
    const searchParams = new URLSearchParams();
    searchParams.set("artist", artist.id);
    searchParams.set("view", "artist_profile");
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );
    useUrlStore.getState().setUrl(window.location.search);
  };
}

export function useHandleOpenAlbum() {
  return (album: Album) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("album", album.id);
    searchParams.set("view", "album");
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );
    useUrlStore.getState().setUrl(window.location.search);
  };
}

export function useChangeView() {
  return (view : string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("view", view);
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );
  };
}