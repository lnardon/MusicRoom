import { useState } from "react";
import { usePlayerStore } from "../stores/playerStore";
import { useUrlStore } from "../stores/urlStore";
import { Album, Artist, Track } from "../types";
import { apiHandler } from "./apiHandler";

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
  const [blobUrlMap, setBlobUrlMap] = useState<Map<string, string>>(new Map());

  return async (song: Track) => {
    if (blobUrlMap.has(song.id)) {
      setSong({
        id: song.id,
        title: song.title,
        artist: song.artist,
        file: blobUrlMap.get(song.id) || "",
        cover: `/api/getCover?file=${song.album.id}`,
      });
      setIsPlaying(true);
      return;
    }

    try {
      const response = await apiHandler(`/api/getSong?file=${song.id}`, "GET")
      if (!response.ok) throw new Error("Failed to fetch song");

      const blob = await response.blob();
      const songUrl = URL.createObjectURL(blob);
      setBlobUrlMap((prev) => new Map(prev).set(song.id, songUrl));
      setSong({
        id: song.id,
        title: song.title,
        artist: song.artist,
        file: songUrl,
        cover: `/api/getCover?file=${song.album.id}`,
      });
      setIsPlaying(true);
      
    } catch (error) {
      console.error("Error loading song:", error);
    }
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