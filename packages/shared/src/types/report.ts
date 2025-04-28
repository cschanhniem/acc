/**
 * Represents a user's report of a whisper for moderation.
 */
export interface Report {
  /** Unique identifier for the report record */
  id: string;
  /** ID of the whisper being reported */
  whisperId: string;
  /** ID of the user submitting the report */
  reporterId: string;
  /** Reason for the report */
  reason: ReportReason;
  /** Optional additional details provided by the reporter */
  details?: string;
  /** Current status of the report */
  status: ReportStatus;
  /** ISO timestamp of when the report was created */
  createdAt: string;
  /** ISO timestamp of when the report was last updated */
  updatedAt: string;
}

/**
 * Valid reasons for reporting a whisper
 */
export type ReportReason =
  | "inappropriate"
  | "spam"
  | "harassment"
  | "misinformation"
  | "other";

/**
 * Current status of a report
 */
export type ReportStatus =
  | "pending"
  | "investigating"
  | "resolved_removed"
  | "resolved_kept"
  | "dismissed";
