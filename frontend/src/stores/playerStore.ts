import { create } from "zustand";

interface PlayerState {
  cover: string;
  filePath: string;
  title: string;
  artist: string;
  setCover: (cover: string) => void;
  setFilePath: (filePath: string) => void;
  setTitle: (title: string) => void;
  setArtist: (artist: string) => void;

  isPlaying: boolean;
  isShuffled: boolean;
  isRepeating: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsShuffled: (isShuffled: boolean) => void;
  setIsRepeating: (isRepeating: boolean) => void;
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
