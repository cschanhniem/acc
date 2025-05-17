import { Hono } from 'hono';
import type { Context } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './middleware/auth';
import { subscriptionCheck } from './middleware/subscription';
import { contracts } from './routes/contracts';
import { billing } from './routes/billing';
import type { AppBindings } from './types/bindings';
import type { ApiErrorResponse, HealthCheckResponse } from '@aicontractcheck/shared';
import { GoogleService } from './services/google';
import { sign, verify } from './utils/jwt';
// Create the app
const app = new Hono<AppBindings>();
// Global middleware
app.use('*', cors({
  origin: (origin, c) => {
    // Allow requests from the configured frontend URL
    return origin === c.env.FRONTEND_URL ? origin : '';
  },
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400,
  credentials: true,
}));
app.post('/api/v1/auth/refresh', async (c) => {
  try {
    const { refreshToken } = await c.req.json();

    if (!refreshToken) {
      return c.json({ error: 'Refresh token is required' }, 400);
    }

    let decoded;
    try {
      decoded = await verify(refreshToken, c.env.JWT_SECRET);
    } catch (e) {
      return c.json({ error: 'Invalid refresh token' }, 401);
    }

    // Check expiration
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return c.json({ error: 'Refresh token expired' }, 401);
    }

    // You can skip user lookup for dev; or retrieve from KV if needed
    const user = {
      id: decoded.userId,
      email: decoded.email,
      displayName: decoded.name,
    };

    // Create new tokens
    const accessToken = await sign(
      {
        userId: user.id,
        email: user.email,
        name: user.displayName,
      },
      c.env.JWT_SECRET
    );

    const newRefreshToken = await sign(
      {
        userId: user.id,
        email: user.email,
        name: user.displayName,
      },
      c.env.JWT_SECRET, 
      Math.floor(Date.now() / 1000) + 7 * 24 * 3600
    );

    return c.json({
      user,
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Token refresh failed' }, 500);
  }
});
app.post('/api/v1/auth/google', async (c) => {
  try {
    const { code } = await c.req.json();
    if (!code) {
      return c.json({ error: 'Missing code' }, 400);
    }

    const googleService = new GoogleService(c.env);
    const user = await googleService.authenticateWithCode(code);

    // Tạo payload cơ bản
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.displayName,
    };

    // Ký access token (ví dụ hết hạn sau 1 giờ)
    const accessToken = await sign(payload, c.env.JWT_SECRET);

    // Ký refresh token (ví dụ hết hạn sau 7 ngày — bạn có thể tùy chỉnh trong hàm sign nếu muốn)
    const refreshToken = await sign(payload,  c.env.JWT_SECRET, Math.floor(Date.now() / 1000) + 7 * 24 * 3600);

    return c.json({
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
});
app.post('/api/v1/auth/logout', async (c) => {
  // Nếu dùng JWT không lưu trạng thái, logout chỉ đơn giản trả về thành công
  return c.json({ message: "Logout successful" });
});
// Protected routes
app.use('/api/*', auth);

// Routes
app.route('/api/contracts', contracts);
app.route('/api/billing', billing);

// Add subscription check to contract routes
app.use('/api/contracts/*', subscriptionCheck);

// Health check
app.get('/health', (c: Context<AppBindings>) => {
  const response: HealthCheckResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development',
    version: '1.0.0'
  };
  return c.json(response);
});

// Error handling
app.onError((err: Error, c: Context<AppBindings>) => {
  console.error(`[${c.req.method}] ${c.req.url}:`, err);
  
  const errorResponse: ApiErrorResponse = {
    error: 'Internal Server Error',
    code: 'SERVER_ERROR',
    message: c.env.ENVIRONMENT === 'development' ? err.message : undefined,
    path: c.req.url
  };

  return c.json(errorResponse, 500);
});

// 404 handler
app.notFound((c: Context<AppBindings>) => {
  const errorResponse: ApiErrorResponse = {
    error: 'Not Found',
    code: 'NOT_FOUND',
    path: c.req.url
  };
  return c.json(errorResponse, 404);
});

export default app;
