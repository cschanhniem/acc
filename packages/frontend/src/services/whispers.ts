import { Whisper, CreateWhisperPayload, Report, ReportReason } from "@peaceflow/shared";
import api from "./api";

// Fetch approved whispers (with optional pagination/filtering)
export async function fetchWhispers(params?: { limit?: number; cursor?: string; theme?: string }) {
  const query = new URLSearchParams(params as any).toString();
  const { data } = await api.get<{ whispers: Whisper[]; cursor: string | null }>(`/api/v1/whispers?${query}`);
  return data;
}

// Fetch a single whisper by ID
export async function fetchWhisperById(id: string) {
  const { data } = await api.get<Whisper>(`/api/v1/whispers/${id}`);
  return data;
}

// Fetch a random approved whisper
export async function fetchRandomWhisper() {
  const { data } = await api.get<Whisper>(`/api/v1/whispers/random`);
  return data;
}

// Create a new whisper (requires auth)
export async function createWhisper(payload: CreateWhisperPayload) {
  const { data } = await api.post<Whisper>(`/api/v1/whispers`, payload);
  return data;
}

// Like/unlike a whisper (requires auth)
export async function toggleLikeWhisper(id: string) {
  const { data } = await api.put<{ liked: boolean; likes: number }>(`/api/v1/whispers/${id}/like`);
  return data;
}

// Report a whisper (requires auth)
export async function reportWhisper(
  id: string,
  data: { reason: ReportReason; details?: string }
) {
  const { data: responseData } = await api.post<{ report: Report }>(
    `/api/v1/whispers/${id}/report`,
    data
  );
  return responseData;
}
