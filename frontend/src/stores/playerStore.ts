import { create } from "zustand";

interface Song {
  cover: string;
  file: string;
  title: string;
  artist: string;
}
interface PlayerState {
  song: Song;
  setSong: (song: Song) => void;

  isPlaying: boolean;
  isShuffled: boolean;
  isRepeating: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsShuffled: (isShuffled: boolean) => void;
  setIsRepeating: (isRepeating: boolean) => void;
}

export const usePlayerStore = create<PlayerState>()((set) => ({
  song: {
    cover: "",
    file: "",
    title: "",
    artist: "",
  },
  setSong: (song: Song) => set({ song }),

  isPlaying: false,
  isShuffled: false,
  isRepeating: false,
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  setIsShuffled: (isShuffled: boolean) => set({ isShuffled }),
  setIsRepeating: (isRepeating: boolean) => set({ isRepeating }),
}));
