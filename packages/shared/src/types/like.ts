/**
 * Represents a "like" action by a user on a whisper.
 */
export interface Like {
  /** Unique identifier for the like record (e.g., userId_whisperId) */
  id: string;
  /** ID of the user who liked the whisper */
  userId: string;
  /** ID of the whisper that was liked */
  whisperId: string;
  /** ISO timestamp of when the like was created */
  createdAt: string;
}
