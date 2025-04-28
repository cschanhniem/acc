export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface TokenPayload {
  sub: string; // user id
  email: string;
  type: "access" | "refresh";
  iat: number; // issued at
  exp: number; // expiration
}

export interface GoogleAuthResponse {
  code: string;
  state: string;
}
