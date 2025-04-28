export type WhisperTheme =
  | "Digital Wellness"
  | "Eco-Mindfulness"
  | "Gentle Productivity"
  | "Authentic Connection"
  | "Micro-Joy"
  | "Resilience";

export interface Whisper {
  id: string;
  text: string;
  authorId?: string; // Optional for pre-populated whispers
  authorName?: string; // Optional, denormalized for display
  theme: WhisperTheme;
  createdAt: string; // ISO 8601 string format
  likes: number;
  viewCount: number;
  isApproved: boolean; // For moderation
}

// Type for creating a new whisper (some fields are set by the backend)
export type CreateWhisperPayload = Pick<Whisper, "text" | "theme"> & {
  authorName?: string; // User can optionally provide name if not logged in? TBD
};

// Type for updating a whisper (e.g., admin approval)
export type UpdateWhisperPayload = Partial<Pick<Whisper, "text" | "theme" | "isApproved">>;
