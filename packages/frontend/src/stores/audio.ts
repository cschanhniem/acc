import { create } from "zustand";
import { AmbientSound } from "@peaceflow/shared";

interface AudioState {
  currentSound: AmbientSound | null;
  isPlaying: boolean;
  volume: number;
  audioElement: HTMLAudioElement | null;
  
  // Actions
  setCurrentSound: (sound: AmbientSound | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setAudioElement: (element: HTMLAudioElement | null) => void;
  togglePlay: () => void;
  play: (sound: AmbientSound) => void;
  stop: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentSound: null,
  isPlaying: false,
  volume: 0.5, // Default volume 50%
  audioElement: null,

  setCurrentSound: (sound) => set({ currentSound: sound }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => {
    set({ volume });
    const { audioElement } = get();
    if (audioElement) {
      audioElement.volume = volume;
    }
  },
  setAudioElement: (element) => set({ audioElement: element }),

  togglePlay: () => {
    const { isPlaying, audioElement } = get();
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      set({ isPlaying: !isPlaying });
    }
  },

  play: (sound) => {
    const { currentSound, audioElement } = get();
    
    // If already playing this sound, just toggle
    if (currentSound?.id === sound.id) {
      get().togglePlay();
      return;
    }

    // Stop current sound if any
    get().stop();

    // Create new audio element
    const audio = new Audio(sound.audioUrl);
    audio.loop = true; // Enable looping for ambient sounds
    audio.volume = get().volume;
    
    // Enable background playback on mobile
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: sound.name,
        artist: "PeaceFlow",
        artwork: [
          { src: `/icons/${sound.icon}-96.png`, sizes: "96x96", type: "image/png" },
          { src: `/icons/${sound.icon}-128.png`, sizes: "128x128", type: "image/png" },
          { src: `/icons/${sound.icon}-192.png`, sizes: "192x192", type: "image/png" },
          { src: `/icons/${sound.icon}-256.png`, sizes: "256x256", type: "image/png" },
        ],
      });

      // Add media session controls
      navigator.mediaSession.setActionHandler("play", () => get().togglePlay());
      navigator.mediaSession.setActionHandler("pause", () => get().togglePlay());
      navigator.mediaSession.setActionHandler("stop", () => get().stop());
    }

    // Play the sound
    audio.play().catch(console.error);
    
    set({
      currentSound: sound,
      audioElement: audio,
      isPlaying: true,
    });
  },

  stop: () => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      audioElement.src = ""; // Clear source
    }
    set({
      currentSound: null,
      audioElement: null,
      isPlaying: false,
    });
  },
}));
