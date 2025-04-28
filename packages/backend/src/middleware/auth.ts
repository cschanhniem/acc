import type { Context } from 'hono';
import { decode, verify } from '../utils/jwt';
import type { AppBindings } from '../types/bindings';

export const auth = async (c: Context<AppBindings>, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }, 401);
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = await verify(token, c.env.JWT_SECRET);
    
    if (!decoded || !decoded.userId) {
      throw new Error('Invalid token');
    }

    c.set('userId', decoded.userId);
    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({
      error: 'Invalid authentication token',
      code: 'AUTH_INVALID'
    }, 401);
  }
};
