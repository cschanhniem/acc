import { Env } from "../types/env";
import { UserProfile } from "@peaceflow/shared";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export class GoogleService {
  constructor(private env: Env) {}

  async getTokens(code: string): Promise<GoogleTokenResponse> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: this.env.GOOGLE_CLIENT_ID,
        client_secret: this.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${this.env.FRONTEND_URL}/auth/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      let errorDetails;
      try {
        const text = await response.text();
        try {
          errorDetails = JSON.parse(text);
        } catch {
          errorDetails = text;
        }
      } catch {
        errorDetails = `Status ${response.status}: ${response.statusText}`;
      }

      console.error("Google token request failed:", {
        status: response.status,
        statusText: response.statusText,
        errorDetails,
        redirectUri: `${this.env.FRONTEND_URL}/auth/callback`
      });

      throw {
        error: "Google OAuth Error",
        message: "Failed to authenticate with Google",
        details: {
          component: "GoogleService.getTokens",
          status: response.status,
          errorResponse: errorDetails
        }
      };
    }

    // If response is OK, parse the JSON body
    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      let errorDetails;
      try {
        const text = await response.text();
        try {
          errorDetails = JSON.parse(text);
        } catch {
          errorDetails = text;
        }
      } catch {
        errorDetails = `Status ${response.status}: ${response.statusText}`;
      }

      console.error("Google user info request failed:", {
        status: response.status,
        statusText: response.statusText,
        errorDetails
      });

      throw {
        error: "Google API Error",
        message: "Failed to retrieve user information",
        details: {
          component: "GoogleService.getUserInfo",
          status: response.status,
          errorResponse: errorDetails
        }
      };
    }

    return response.json();
  }

  async createOrUpdateUser(userInfo: GoogleUserInfo): Promise<UserProfile> {
    const userId = `google_${userInfo.id}`;
    const now = new Date().toISOString();

    // Try to get existing user
    if (!this.env.USERS) {
      console.error("Environment check:", {
        hasEnv: !!this.env,
        envKeys: Object.keys(this.env),
        kvBindings: this.env.USERS ? "present" : "missing"
      });
      throw {
        error: "Configuration Error",
        message: "USERS KV namespace is not properly bound. Please check worker configuration.",
        details: {
          component: "GoogleService.createOrUpdateUser",
          userId
        }
      };
    }

    try {
      const existingUser = await this.env.USERS.get(userId, "json") as UserProfile | null;

      const user: UserProfile = {
        id: userId,
        email: userInfo.email,
        displayName: userInfo.name,
        profileImage: userInfo.picture,
        createdAt: existingUser?.createdAt || now,
        updatedAt: now,
      };

      // Store user in KV
      await this.env.USERS.put(userId, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error("KV operation failed:", {
        operation: "createOrUpdateUser",
        userId,
        error: error instanceof Error ? error.message : error
      });
      throw {
        error: "Database Operation Failed",
        message: "Failed to create or update user profile",
        details: {
          component: "GoogleService.createOrUpdateUser",
          userId,
          originalError: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  async authenticateWithCode(code: string) {
    const tokens = await this.getTokens(code);
    const userInfo = await this.getUserInfo(tokens.access_token);
    return this.createOrUpdateUser(userInfo);
  }
}
