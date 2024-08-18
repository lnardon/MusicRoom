import { create } from "zustand";

interface Song {
  cover: string;
  file: string;
  title: string;
  artist: {
    id: string;
    name: string;
  };
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

  queue: Song[];
  setQueue: (queue: Song[]) => void;

  audioRef: HTMLAudioElement | null;
  setAudioRef: (audioRef: HTMLAudioElement) => void;

  freq1: number;
  freq2: number;
  setFreq1: (freq1: number) => void;
  setFreq2: (freq2: number) => void;
}

export const usePlayerStore = create<PlayerState>()((set) => ({
  song: {
    cover: "",
    file: "",
    title: "",
    artist: {
      id: "",
      name: "",
    },
  },
  setSong: (song: Song) => set({ song }),

  isPlaying: false,
  isShuffled: false,
  isRepeating: false,
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  setIsShuffled: (isShuffled: boolean) => set({ isShuffled }),
  setIsRepeating: (isRepeating: boolean) => set({ isRepeating }),

  queue: [],
  setQueue: (queue: Song[]) => set({ queue }),

  audioRef: null,
  setAudioRef: (audioRef: HTMLAudioElement) => set({ audioRef }),

  freq1: 0,
  freq2: 0,

  setFreq1: (freq1: number) => set({ freq1 }),
  setFreq2: (freq2: number) => set({ freq2 }),
}));
