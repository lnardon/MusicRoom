import { useRef } from "react";

export function useAudioAnalyser(
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  isPlaying: boolean
) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  if (isPlaying && audioRef.current && !audioContextRef.current) {
    audioContextRef.current = new AudioContext();
    sourceRef.current = audioContextRef.current.createMediaElementSource(
      audioRef.current
    );
    analyserRef.current = audioContextRef.current.createAnalyser();
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);
    analyserRef.current.fftSize = 4096;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
  }

  return {
    startAnalyser: (
      setCurrentVolume: (volume: number) => void,
      setCurrentVolume2: (volume: number) => void
    ) => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        setCurrentVolume(dataArray[16]);
        setCurrentVolume2(dataArray[32]);
      }
    },

    stopAnalyser: () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    },
  };
}
