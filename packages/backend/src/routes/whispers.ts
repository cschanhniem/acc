import { Hono } from "hono";
import { Bindings } from "../types/env";
import { Whisper, CreateWhisperPayload, WhisperTheme, Like } from "@peaceflow/shared"; // Import types
import { HTTPException } from "hono/http-exception";
import { nanoid } from "nanoid";
import { z } from "zod"; // Import Zod
import { zValidator } from "@hono/zod-validator"; // Import Zod validator for Hono
import { authMiddleware, AuthenticatedUser } from "../middleware/auth"; // Import auth middleware and type

// Define valid themes for Zod schema based on the shared type
const validThemes: [WhisperTheme, ...WhisperTheme[]] = [
  "Digital Wellness",
  "Eco-Mindfulness",
  "Gentle Productivity",
  "Authentic Connection",
  "Micro-Joy",
  "Resilience",
];

// Zod schema for creating a whisper payload
const createWhisperSchema = z.object({
  text: z.string({ required_error: "Text is required" })
           .min(1, "Text cannot be empty")
           .max(500, "Text cannot exceed 500 characters"),
  theme: z.enum(validThemes, { required_error: "Theme is required", invalid_type_error: "Invalid theme selected" }),
  authorName: z.string().max(50, "Author name cannot exceed 50 characters").optional(),
});


const whispers = new Hono<{ Bindings: Bindings }>();

// Zod schema for query parameters (pagination, filtering)
const listWhispersQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  theme: z.enum(validThemes).optional(),
});

// --- Public Endpoints ---

// GET /api/v1/whispers - List approved whispers with pagination and filtering
whispers.get(
  "/",
  zValidator("query", listWhispersQuerySchema, (result, c) => {
    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      throw new HTTPException(400, { message: `Invalid query parameters: ${errorMessages}` });
    }
  }),
  async (c) => {
    const { WHISPERS } = c.env;
    const { limit, cursor, theme } = c.req.valid("query");

    try {
      // KV list is basic, filtering happens after fetching keys/values
      // TODO: For larger scale, consider indexing themes or using a different DB
      // Log initial request params
      console.log("Fetching whispers with params:", { limit, cursor, theme });

      const listOptions: KVNamespaceListOptions = { limit, cursor };
      console.log("Using KV list options:", { ...listOptions, prefix: "whisper:" });

      const list = await WHISPERS.list<Whisper>({ ...listOptions, prefix: "whisper:" });
      const nextCursor = 'cursor' in list ? (list as any).cursor : null;

      console.log("KV list result:", { 
        keyCount: list.keys.length,
        listComplete: list.list_complete,
        hasCursor: !!nextCursor
      });

      console.log("Found keys:", list.keys.map(k => k.name));
      const whispersData = await Promise.all(
        list.keys.map(async (key: KVNamespaceListKey<unknown>) => {
          console.log("Fetching whisper:", key.name);
          try {
            const whisper = await WHISPERS.get<Whisper>(key.name, "json");
            return whisper;
          } catch (err) {
            console.error(`Error fetching whisper ${key.name}:`, err);
            return null;
          }
        })
      );

      // Filter out nulls and unapproved whispers
      const validWhispers = whispersData.filter((w): w is Whisper => !!w);
      console.log("Valid whispers count:", validWhispers.length);
      console.log("Whispers before approval filter:", validWhispers.map(w => ({ id: w.id, isApproved: w.isApproved })));

      let filteredWhispers = validWhispers; //temp disable: validWhispers.filter(w => w.isApproved);
      console.log("Approved whispers count:", filteredWhispers.length);
      if (theme) {
        filteredWhispers = filteredWhispers.filter(w => w.theme === theme);
      }

      return c.json({
        whispers: filteredWhispers,
        cursor: list.list_complete ? null : nextCursor, // Pass cursor for next page
      });

    } catch (e) {
      console.error("Error listing whispers:", e);
      throw new HTTPException(500, { message: "Failed to retrieve whispers" });
    }
  }
);

// GET /api/v1/whispers/random - Get a random approved whisper
whispers.get("/random", async (c) => {
  const { WHISPERS } = c.env;
  try {
    // Inefficient for large datasets, but works for MVP with KV
    // TODO: Consider alternative strategies for large scale (e.g., index, periodic shuffle)
    const list = await WHISPERS.list<Whisper>({
      prefix: "whisper:"
    });

    const allWhispers = await Promise.all(
      list.keys.map(async (key: KVNamespaceListKey<unknown>) => {
        try {
          const whisper = await WHISPERS.get<Whisper>(key.name, "json");
          return whisper;
        } catch (err) {
          console.error(`Error fetching whisper ${key.name}:`, err);
          return null;
        }
      })
    );

    // Filter out nulls and unapproved whispers
    const approvedWhispers = allWhispers.filter((w): w is Whisper => !!w && w.isApproved);

    if (approvedWhispers.length === 0) {
      throw new HTTPException(404, { message: "No approved whispers found" });
    }

    const randomIndex = Math.floor(Math.random() * approvedWhispers.length);
    const randomWhisper = approvedWhispers[randomIndex];

    return c.json(randomWhisper);
  } catch (e) {
    console.error("Error listing whispers:", e);
    throw new HTTPException(500, { message: "Failed to retrieve whispers" });
  }
});


// GET /api/v1/whispers/:id - Get a single whisper by ID
whispers.get("/:id", async (c) => {
  const { id } = c.req.param();
  const { WHISPERS } = c.env;
  try {
    const whisper = await WHISPERS.get<Whisper>(`whisper:${id}`, "json");
    if (!whisper) {
      throw new HTTPException(404, { message: "Whisper not found" });
    }

    // Increment view count (non-atomic, okay for MVP)
    const updatedWhisper = { ...whisper, viewCount: (whisper.viewCount || 0) + 1 };

    // Update the whisper in KV store (fire-and-forget for performance, error handled below)
    c.executionCtx.waitUntil(
      WHISPERS.put(`whisper:${id}`, JSON.stringify(updatedWhisper))
        .catch(err => console.error(`Failed to update view count for whisper ${id}:`, err))
    );

    // Return the original whisper data immediately for faster response
    // The view count update happens in the background.
    return c.json(whisper);

  } catch (e) {
    console.error(`Error fetching whisper ${id}:`, e);
     if (e instanceof HTTPException) throw e;
    throw new HTTPException(500, { message: "Failed to retrieve whisper" });
  }
});

// --- Authenticated Endpoints (Placeholder - Middleware needed) ---

// POST /api/v1/whispers - Submit a new whisper (Requires Authentication)
whispers.post(
  "/",
  authMiddleware, // Apply auth middleware first
  zValidator("json", createWhisperSchema, (result, c) => {
    if (!result.success) {
      // Construct a user-friendly error message from Zod issues
      const errorMessages = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      throw new HTTPException(400, { message: `Validation failed: ${errorMessages}` });
    }
  }),
  async (c) => {
    const { WHISPERS } = c.env;
    // Explicitly type user from context using the imported type
    const user = c.get("user") as AuthenticatedUser | undefined;
    const validatedPayload = c.req.valid("json"); // Use validated data

    if (!user) {
      // This case should be prevented by the authMiddleware, but added for type safety
      throw new HTTPException(401, { message: "Authentication required" });
    }

    // Manual check removed as Zod handles it
    // if (!validatedPayload.text || !validatedPayload.theme) {
    //    throw new HTTPException(400, { message: "Text and theme are required" });
    // }

    const newWhisper: Whisper = {
    id: nanoid(10),
    text: validatedPayload.text,
    theme: validatedPayload.theme,
    authorId: user.id, // Use authenticated user's ID
    authorName: user.displayName || "Anonymous", // Use displayName, provide fallback
    createdAt: new Date().toISOString(),
    likes: 0,
    viewCount: 0,
    isApproved: false, // Requires moderation
  };

  try {
    await WHISPERS.put(`whisper:${newWhisper.id}`, JSON.stringify(newWhisper));
    return c.json(newWhisper, 201);
  } catch (e) {
    console.error("Error creating whisper:", e);
    throw new HTTPException(500, { message: "Failed to create whisper" });
  }
});

// --- Like System ---

// PUT /api/v1/whispers/:id/like - Toggle like on a whisper
whispers.put(
  "/:id/like",
  authMiddleware,
  async (c) => {
    const { WHISPERS, LIKES } = c.env;
    const user = c.get("user") as AuthenticatedUser | undefined;
    const { id: whisperId } = c.req.param();

    if (!user) {
      throw new HTTPException(401, { message: "Authentication required" });
    }

    try {
      // Check if whisper exists
      const whisper = await WHISPERS.get(`whisper:${whisperId}`, "json") as Whisper | null;
      if (!whisper) {
        throw new HTTPException(404, { message: "Whisper not found" });
      }

      // Create a unique ID for the like record
      const likeId = `${user.id}_${whisperId}`;

      // Check if user has already liked this whisper
      const existingLike = await LIKES.get(likeId);

      if (existingLike) {
        // Unlike: Remove like record and decrement whisper's like count
        await LIKES.delete(likeId);
        const updatedWhisper = {
          ...whisper,
          likes: Math.max(0, whisper.likes - 1), // Ensure likes don't go below 0
        };
        await WHISPERS.put(`whisper:${whisperId}`, JSON.stringify(updatedWhisper));
        return c.json({ liked: false, likes: updatedWhisper.likes });
      } else {
        // Like: Create like record and increment whisper's like count
        const like: Like = {
          id: likeId,
          userId: user.id,
          whisperId,
          createdAt: new Date().toISOString(),
        };
        await LIKES.put(likeId, JSON.stringify(like));
        const updatedWhisper = {
          ...whisper,
          likes: (whisper.likes || 0) + 1,
        };
        await WHISPERS.put(`whisper:${whisperId}`, JSON.stringify(updatedWhisper));
        return c.json({ liked: true, likes: updatedWhisper.likes });
      }
    } catch (e) {
      console.error(`Error toggling like for whisper ${whisperId}:`, e);
      if (e instanceof HTTPException) throw e;
      throw new HTTPException(500, { message: "Failed to toggle like" });
    }
  }
);

// --- Reporting System ---

import { Report, ReportReason, ReportStatus } from "@peaceflow/shared";

// Zod schema for report creation
const createReportSchema = z.object({
  reason: z.enum([
    "inappropriate",
    "spam",
    "harassment",
    "misinformation",
    "other"
  ]),
  details: z.string().max(500, "Details cannot exceed 500 characters").optional(),
});

// POST /api/v1/whispers/:id/report - Report a whisper
whispers.post(
  "/:id/report",
  authMiddleware,
  zValidator("json", createReportSchema, (result, c) => {
    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      throw new HTTPException(400, { message: `Validation failed: ${errorMessages}` });
    }
  }),
  async (c) => {
    const { REPORTS, WHISPERS } = c.env;
    const user = c.get("user") as AuthenticatedUser | undefined;
    const { id: whisperId } = c.req.param();
    const { reason, details } = c.req.valid("json");

    if (!user) {
      throw new HTTPException(401, { message: "Authentication required" });
    }

    // Check if whisper exists
    const whisper = await WHISPERS.get<Whisper>(`whisper:${whisperId}`, "json");
    if (!whisper) {
      throw new HTTPException(404, { message: "Whisper not found" });
    }

    // Create a unique report ID (userId_whisperId_timestamp)
    const reportId = `${user.id}_${whisperId}_${Date.now()}`;

    const now = new Date().toISOString();
    const report: Report = {
      id: reportId,
      whisperId,
      reporterId: user.id,
      reason,
      details,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    await REPORTS.put(reportId, JSON.stringify(report));

    return c.json({ report });
  }
);

// --- TODO: Other Endpoints ---
// GET /admin/pending (requires admin role)
// PUT /admin/:id/approve (requires admin role)

export default whispers;
