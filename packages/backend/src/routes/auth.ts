import { Hono, Context } from "hono";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { Env } from "../types/env";
import { GoogleService } from "../services/google";
import { sign, verify } from "../utils/jwt"; // Import correct functions
import { UserModel } from "../models/users";
import { User } from "../models/types";

// --- Schemas ---
const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().min(1, "Name is required"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// --- Input types inferred from schemas ---
type SignupInput = z.infer<typeof signupSchema>;
type LoginInput = z.infer<typeof loginSchema>;

// --- Define the environment ---
type AppEnv = {
  Bindings: Env;
  Variables: {}; // Placeholder for context variables if needed
};

const ErrorCodes = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// Safely converts any value to a string representation.
const safeStringify = (value: unknown): string => {
  try {
    if (value instanceof Error) return value.message;
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    // Attempt to stringify objects, handle potential circular references or errors
    if (typeof value === 'object') return JSON.stringify(value) || '';
    // Fallback for other types (numbers, booleans, etc.)
    return String(value);
  } catch (e) {
    // Handle potential errors during stringification (e.g., circular objects)
    console.error("Error during safeStringify:", e);
    // Provide a fallback string representation
    return typeof value === 'symbol' ? value.toString() : '[Unstringifiable value]';
  }
};

interface ErrorDetails {
  readonly type: string;
  readonly message: string;
  readonly code: ErrorCode;
  readonly stack?: string;
  readonly details?: unknown; // Added details field
}

interface ErrorResponse extends Record<string, unknown> {
  error: string;
  message: string;
  stack?: string;
  details?: string;
}

class ApiError {
  private constructor(private readonly details: ErrorDetails) {}

  static fromError(error: Error, type: string): ApiError {
    return new ApiError({
      type: safeStringify(type),
      message: safeStringify(error.message),
      code: this.determineCode(safeStringify(error.message)),
      stack: safeStringify(error.stack)
    });
  }

  static fromValue(value: unknown, type: string): ApiError {
    let message: string;
    let stack: string | undefined;
    let details: unknown;

    try {
      if (value && typeof value === 'object') {
        const err = value as Record<string, unknown>;
        message = safeStringify(err.error || err.message || value);
        stack = err.stack ? safeStringify(err.stack) : new Error().stack;
        details = err.details;
      } else {
        message = safeStringify(value);
        stack = new Error().stack;
      }
    } catch (_) {
      message = '[Unknown Error]';
      stack = new Error().stack;
    }

    return new ApiError({
      type: safeStringify(type),
      message,
      code: this.determineCode(message),
      stack,
      details // Pass details through
    });
  }

  // Determines the HTTP status code based on the error message content.
  private static determineCode(message: string | undefined): ErrorCode {
    // Handle undefined or null messages gracefully
    if (!message) {
      return ErrorCodes.SERVER_ERROR;
    }
    if (message.includes("Failed to get Google tokens")) {
      return ErrorCodes.BAD_REQUEST;
    }
    if (message.includes("Failed to get user info")) {
      return ErrorCodes.UNAUTHORIZED;
    }
    // Add more specific checks if needed
    if (message.includes("Invalid") || message.includes("Unauthorized")) {
        return ErrorCodes.UNAUTHORIZED;
    }
    if (message.includes("not found")) {
        return ErrorCodes.NOT_FOUND;
    }
    if (message.includes("required") || message.includes("missing")) {
        return ErrorCodes.BAD_REQUEST;
    }
    return ErrorCodes.SERVER_ERROR;
  }

  // Generates a JSON response object for the error.
  toResponse(isDev: boolean): ErrorResponse {
    // Always include full error details regardless of environment
    const response: ErrorResponse = {
      error: this.details.type,
      message: this.details.message,
      details: this.details.details ? safeStringify(this.details.details) : undefined, // Safely stringify details
      stack: this.details.stack || new Error().stack // Always include stack trace
    };

    // Log full error details for debugging
    console.error("Error details:", {
      ...this.details,
      stack: this.details.stack
    });

    return response;
  }

  // Generates a string suitable for logging.
  toLogString(prefix: unknown): string {
    const safePrefix = safeStringify(prefix);
    const { type, code, message, details, stack } = this.details;

    const log = {
      type,
      code,
      message,
      details,
      stack: stack || undefined
    };

    console.error(`${safePrefix}:`, log);
    return `${safePrefix}: ${type} [${code}] - ${message}`;
  }

  // Returns the HTTP status code associated with the error.
  getStatusCode(): number {
    return this.details.code;
  }
}

// Update ErrorContext type to use Hono's Context
interface ErrorContext extends Context<AppEnv> {} // Use Context<AppEnv>

// Factory function to create standardized error handlers for Hono routes.
const createErrorHandler = (type: string, prefix: string) =>
  (error: unknown, c: ErrorContext): Response => { // Use ErrorContext type
    // Ensure 'type' and 'prefix' are strings before creating the ApiError
    const safeType = safeStringify(type);
    const safePrefix = safeStringify(prefix);

    // Create an ApiError instance from the caught error (could be Error or other type)
    const apiError = error instanceof Error
      ? ApiError.fromError(error, safeType)
      : ApiError.fromValue(error, safeType);

    // Log the detailed error message to the console
    const logMessage: string = apiError.toLogString(safePrefix);
    console.error(logMessage);

    // Return a JSON response to the client
    // Use c.env directly as c is now fully typed Context<AppEnv>
    return c.json(
      apiError.toResponse(c.env.ENVIRONMENT === "development"),
      apiError.getStatusCode()
    );
  };

// Specific error handlers for different authentication flows
const handleAuthError = createErrorHandler("Authentication failed", "Auth error");
const handleRefreshError = createErrorHandler("Token refresh failed", "Refresh token error");
const handleSignupError = createErrorHandler("Signup failed", "Signup error");
const handleLoginError = createErrorHandler("Login failed", "Login error");

// Hono application instance for authentication routes
const auth = new Hono<AppEnv>(); // Use AppEnv

// --- Route Handlers ---

// Email/Password Signup
auth.post("/signup", async (c: Context<AppEnv>) => { // Type c
  try {
    const body = await c.req.json();
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return c.json({ error: "Invalid input", details: result.error.issues }, ErrorCodes.BAD_REQUEST);
    }
    const data = result.data;
    const { email, password, name } = data;
    if (!c.env) throw new Error("Environment not available");

    const userModel = new UserModel(c.env.DB);

    // Check if user already exists
    const existingUserResult = await userModel.findByEmail(email);
    if (existingUserResult.success) {
      return c.json({ error: "User already exists with this email" }, ErrorCodes.BAD_REQUEST);
    }

    // Hash password
    const saltRounds = 10; // Standard practice
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUserResult = await userModel.create({
      email,
      name,
      password_hash: passwordHash,
      subscription_tier: "free", // Default tier
      subscription_ends_at: null,
    });

    if (!newUserResult.success || !newUserResult.data) {
      throw new Error(newUserResult.error || "Failed to create user");
    }

    const user = newUserResult.data; // Should be User type here

    // Generate tokens
    const accessToken = await sign(
      { userId: user.id, email: user.email, name: user.name },
      c.env.JWT_SECRET
    );
    // TODO: Implement refresh token generation if needed
    const tokens = { accessToken }; // Simplified for now

    // Omit password hash from response
    const { password_hash, ...userResponse } = user;

    return c.json({ user: userResponse, tokens });
  } catch (error) {
    return handleSignupError(error, c);
  }
});

// Email/Password Login
auth.post("/login", async (c: Context<AppEnv>) => { // Type c
  try {
    const body = await c.req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return c.json({ error: "Invalid input", details: result.error.issues }, ErrorCodes.BAD_REQUEST);
    }
    const data = result.data;
    const { email, password } = data;
    if (!c.env) throw new Error("Environment not available");

    const userModel = new UserModel(c.env.DB);

    // Find user by email
    const userResult = await userModel.findByEmail(email);
    if (!userResult.success || !userResult.data) { // Check data existence
      return c.json({ error: "Invalid email or password" }, ErrorCodes.UNAUTHORIZED);
    }

    const user = userResult.data; // Should be User type here

    // Check if password hash exists (user might have signed up with Google)
    if (!user.password_hash) {
      return c.json({ error: "Account exists but was created with Google. Please log in with Google." }, ErrorCodes.BAD_REQUEST);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return c.json({ error: "Invalid email or password" }, ErrorCodes.UNAUTHORIZED);
    }

    // Generate tokens
    const accessToken = await sign(
      { userId: user.id, email: user.email, name: user.name },
      c.env.JWT_SECRET
    );
    // TODO: Implement refresh token generation if needed
    const tokens = { accessToken }; // Simplified for now

    // Omit password hash from response
    const { password_hash, ...userResponse } = user;

    return c.json({ user: userResponse, tokens });
  } catch (error) {
    return handleLoginError(error, c);
  }
});

// Google OAuth callback handler
auth.post("/google", async (c: Context<AppEnv>) => { // Type c
  try {
    // Parse JSON without explicit generic, add checks
    const body = await c.req.json();
    if (!body || typeof body !== 'object' || !('code' in body) || typeof body.code !== 'string') {
        throw new Error("Authorization code is missing or invalid in request body.");
    }
    const code = body.code;

    if (!c.env) {
      throw new Error("Environment not available");
    }

    const googleService = new GoogleService(c.env);
    const googleUser = await googleService.authenticateWithCode(code);

    // Check if user exists, if not create one
    const userModel = new UserModel(c.env.DB);
    let userResult = await userModel.findByEmail(googleUser.email);
    let user: User;

    if (!userResult.success) {
      // User doesn't exist, create a new one without password hash
      const newUserResult = await userModel.create({
        email: googleUser.email,
        name: googleUser.displayName,
        subscription_tier: "free",
        subscription_ends_at: null,
        // No password_hash for Google signup
      });
      if (!newUserResult.success || !newUserResult.data) { // Check data
        throw new Error(newUserResult.error || "Failed to create user after Google auth");
      }
      user = newUserResult.data; // Should be User
    } else {
      if (!userResult.data) { // Add check for data existence even on success
         throw new Error("User found successfully but data is missing.");
      }
      user = userResult.data; // Should be User
      // Optional: Update user's name if it changed in Google?
      // if (user.name !== googleUser.displayName) { ... }
    }

    // Generate tokens
    const accessToken = await sign(
      { userId: user.id, email: user.email, name: user.name },
      c.env.JWT_SECRET
    );
    // TODO: Implement refresh token generation if needed
    const tokens = { accessToken }; // Simplified for now

    // Omit password hash from response if it exists
    const { password_hash, ...userResponse } = user;

    return c.json({ user: userResponse, tokens });
  } catch (error) {
    // Use the standardized error handler
    return handleAuthError(error, c);
  }
});

// Refresh token handler
auth.post("/refresh", async (c: Context<AppEnv>) => { // Type c
  try {
    if (!c.env) {
      throw new Error("Environment not available");
    }

    // Parse JSON without explicit generic, add checks
    const body = await c.req.json();
     if (!body || typeof body !== 'object' || !('refreshToken' in body) || typeof body.refreshToken !== 'string') {
        return c.json({ error: "Refresh token is missing or invalid in request body" }, ErrorCodes.BAD_REQUEST);
    }
    const refreshToken = body.refreshToken;

    // TODO: Implement proper refresh token verification logic if different from access token
    const payload = await verify(refreshToken, c.env.JWT_SECRET); // Use verify

    if (!payload || !payload.userId || !payload.email || !payload.name) { // Check userId
      return c.json({ error: "Invalid or expired refresh token" }, ErrorCodes.UNAUTHORIZED);
    }

    // Regenerate tokens using payload data
    const accessToken = await sign(
      { userId: payload.userId, email: payload.email, name: payload.name }, // Use userId
      c.env.JWT_SECRET
    );
    // TODO: Implement refresh token generation if needed
    const tokens = { accessToken }; // Simplified for now

    // Optionally, fetch user data again to ensure it's up-to-date
    const userModel = new UserModel(c.env.DB);
    const userResult = await userModel.findById(payload.userId); // Use userId
    if (!userResult.success || !userResult.data) { // Check data existence
      // This shouldn't happen if the refresh token was valid, but handle defensively
      return c.json({ error: "User associated with token not found" }, ErrorCodes.NOT_FOUND);
    }

    const user = userResult.data; // Should be User

    // Omit password hash from response
    const { password_hash, ...userResponse } = user;

    return c.json({ user: userResponse, tokens });
  } catch (error) {
     // Handle potential errors during token verification or KV access
    return handleRefreshError(error, c);
  }
});

// Logout handler (currently just returns a success message)
auth.post("/logout", (c: Context<AppEnv>) => { // Type c
  // In a real application, you might invalidate tokens here (e.g., add to a blocklist)
  return c.json({ message: "Logged out successfully" });
});

export default auth;
