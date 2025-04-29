import { Hono } from 'hono';
import type { Context } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './middleware/auth';
import { subscriptionCheck } from './middleware/subscription';
import { contracts } from './routes/contracts';
import { billing } from './routes/billing';
import type { AppBindings } from './types/bindings';
import type { ApiErrorResponse, HealthCheckResponse } from '@aicontractcheck/shared';
import authRoute from './routes/auth';

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

// Protected routes
app.use('/api/*', auth);

// Routes
app.route('/api/contracts', contracts);
app.route('/api/billing', billing);
app.route('/auth', authRoute);

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
