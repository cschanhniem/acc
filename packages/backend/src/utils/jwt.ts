interface JWTPayload {
  userId: string; // Changed from sub for consistency
  email: string;
  name: string; // Added name
  exp: number;
}

export async function verify(token: string, secret: string): Promise<JWTPayload> {
  // For development, just decode the token without verification
  // TODO: Implement proper JWT verification
  try {
    const [header, payload, signature] = token.split('.');
    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    );
    return decodedPayload as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function sign(payload: Omit<JWTPayload, 'exp'>, secret: string, exp?: number): Promise<string> {
  // For development, just create a simple token
  // TODO: Implement proper JWT signing
 const expiration = exp ?? (Math.floor(Date.now() / 1000) + 24 * 60 * 60);

  const tokenPayload = {
    ...payload,
    exp: expiration,
  };

  const base64Payload = btoa(JSON.stringify(tokenPayload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `dev.${base64Payload}.sig`;
}
