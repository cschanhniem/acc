import { create } from "zustand";
import type { Whisper, CreateWhisperPayload, Report, ReportReason, WhisperTheme } from "@peaceflow/shared";
import toast from "react-hot-toast";
import {
  fetchWhispers,
  fetchWhisperById,
  fetchRandomWhisper,
  createWhisper,
  toggleLikeWhisper,
  reportWhisper as reportWhisperApi
} from "../services/whispers";
import { useAuthStore } from "./auth"; // Import auth store to get token

interface WhispersState {
  whispers: Whisper[];
  selectedWhisper: Whisper | null;
  selectedTheme: WhisperTheme | null;
  loading: boolean;
  error: string | null;
  cursor: string | null;
  currentPage: number;
  itemsPerPage: number;
}

interface WhispersActions {
  loadWhispers: (params?: { limit?: number; cursor?: string; theme?: string }) => Promise<void>;
  loadWhisper: (id: string) => Promise<void>;
  loadRandomWhisper: () => Promise<void>;
  submitWhisper: (payload: CreateWhisperPayload) => Promise<Whisper>;
  likeWhisper: (id: string) => Promise<{ liked: boolean; likes: number }>;
  reportWhisper: (id: string, data: { reason: ReportReason; details?: string }) => Promise<{ report: Report }>;
  setTheme: (theme: WhisperTheme | null) => void;
  clearError: () => void;
}

export const useWhispersStore = create<WhispersState & WhispersActions>((set, get) => ({
  // Initial State
  whispers: [],
  selectedWhisper: null,
  selectedTheme: null,
  loading: false,
  error: null,
  cursor: null,
  currentPage: 1,
  itemsPerPage: 10,

  // Actions
  clearError: () => set({ error: null }),
  setTheme: (theme) => {
    set({ selectedTheme: theme });
    // Reload whispers with new theme filter
    const state = useWhispersStore.getState();
    state.loadWhispers({ theme: theme || undefined });
  },

  loadWhispers: async (params) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const { whispers, cursor } = await fetchWhispers({
        ...params,
        limit: params?.limit || state.itemsPerPage
      });
      set((state) => ({
        whispers,
        cursor,
        loading: false,
        currentPage: params?.cursor ? state.currentPage + 1 : 1
      }));
    } catch (e: any) {
      console.error("Failed to load whispers:", e);
      set({ 
        error: e?.response?.data?.message || e?.message || "Failed to load whispers",
        loading: false,
        whispers: [] 
      });
    }
  },

  loadWhisper: async (id) => {
    set({ loading: true, error: null });
    try {
      const whisper = await fetchWhisperById(id);
      set({ selectedWhisper: whisper, loading: false });
    } catch (e: any) {
      console.error("Failed to load whisper:", e);
      const message = e?.response?.data?.message || e?.message || "Failed to load whisper";
      set({ error: message, loading: false, selectedWhisper: null });
      toast.error(message);
    }
  },

  loadRandomWhisper: async () => {
    set({ loading: true, error: null });
    try {
      const whisper = await fetchRandomWhisper();
      set({ selectedWhisper: whisper, loading: false });
    } catch (e: any) {
      set({ error: e?.message || "Failed to load random whisper", loading: false });
    }
  },

  submitWhisper: async (payload) => {
    if (!useAuthStore.getState().accessToken) {
      throw new Error("Authentication required");
    }
    set({ loading: true, error: null });
    try {
      const newWhisper = await createWhisper(payload);
      set((state) => ({
        whispers: [newWhisper, ...state.whispers],
        loading: false,
      }));
      toast.success("Whisper shared successfully!");
      return newWhisper;
    } catch (e: any) {
      const message = e?.message || "Failed to submit whisper";
      set({ error: message, loading: false });
      toast.error(message);
      throw e;
    }
  },

  likeWhisper: async (id) => {
    if (!useAuthStore.getState().accessToken) {
      throw new Error("Authentication required");
    }
    try {
      const result = await toggleLikeWhisper(id);
      // Update state with actual like count from response
      set((state) => ({
        whispers: state.whispers.map(w =>
          w.id === id ? { ...w, likes: result.likes } : w
        ),
        selectedWhisper: state.selectedWhisper?.id === id
          ? { ...state.selectedWhisper, likes: result.likes }
          : state.selectedWhisper,
      }));
      return result;
    } catch (e: any) {
      const message = e?.message || "Failed to like/unlike whisper";
      set({ error: message });
      toast.error(message);
      // Revert optimistic update if needed
      throw e;
    }
  },

  reportWhisper: async (id, data) => {
    if (!useAuthStore.getState().accessToken) {
      throw new Error("Authentication required");
    }
    set({ loading: true, error: null }); // Indicate loading for report
    try {
      const result = await reportWhisperApi(id, data);
      set({ loading: false });
      toast.success("Report submitted successfully");
      return result;
    } catch (e: any) {
      set({ error: e?.message || "Failed to report whisper", loading: false });
      throw e;
    }
  },
}));
