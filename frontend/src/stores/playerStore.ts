import { create } from "zustand";

interface PlayerState {
  cover: string;
  filePath: string;
  title: string;
  artist: string;

  isPlaying: boolean;
  isShuffled: boolean;
  isRepeating: boolean;
}

export const usePlayerStore = create<PlayerState>()((set) => ({
  cover: "",
  filePath: "",
  title: "",
  artist: "",
  setCover: (cover: string) => set({ cover }),
  setFilePath: (filePath: string) => set({ filePath }),
  setTitle: (title: string) => set({ title }),
  setArtist: (artist: string) => set({ artist }),

  isPlaying: false,
  isShuffled: false,
  isRepeating: false,
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  setIsShuffled: (isShuffled: boolean) => set({ isShuffled }),
  setIsRepeating: (isRepeating: boolean) => set({ isRepeating }),
}));
