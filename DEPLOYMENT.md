#AI Contract Check Deployment Guide

## Prerequisites

1. **Cloudflare Account Setup**
   - [ ] Create a Cloudflare account if you don't have one
   - [ ] Install Wrangler CLI: `npm install -g wrangler`
   - [ ] Login to Cloudflare: `wrangler login`

2. **Google OAuth Setup**
   - [ ] Create a project in Google Cloud Console
   - [ ] Enable Google OAuth2 API
   - [ ] Create OAuth 2.0 credentials
   - [ ] Add authorized redirect URIs:
     - Development: `http://localhost:3000/auth/callback`
     - Production: `https://AIContractCheck.com/auth/callback`

## Environment Configuration

1. **Backend (.dev.vars)**
   ```bash
   ENVIRONMENT=production
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=https://AIContractCheck.com
   ```

2. **Frontend (.env.production)**
   ```bash
   VITE_API_URL=https://api.AIContractCheck.workers.dev
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_AUTH_REDIRECT_URL=https://AIContractCheck.com/auth/callback
   ```

## Deployment Steps

1. **First-time Setup**
   ```bash
   # Login to Cloudflare
   wrangler login

   # Create KV namespaces (if not already created)
   cd packages/backend
   pnpm wrangler kv:namespace create USERS
   pnpm wrangler kv:namespace create WHISPERS
   pnpm wrangler kv:namespace create LIKES
   ```

2. **Set Production Secrets**
   ```bash
   cd packages/backend
   pnpm wrangler secret put GOOGLE_CLIENT_ID
   pnpm wrangler secret put GOOGLE_CLIENT_SECRET
   pnpm wrangler secret put JWT_SECRET
   ```

3. **Deploy**

   **Option 1: Deploy Everything**
   ```bash
   # From project root
   pnpm deploy
   ```

   **Option 2: Deploy Individual Services**
   ```bash
   # Deploy backend only
   pnpm deploy:backend

   # Deploy frontend only
   pnpm deploy:frontend
   ```

## Post-Deployment Verification

1. **Frontend Checks**
   - [ ] Visit `https://AIContractCheck.com`
   - [ ] Verify Google login works
   - [ ] Check user profile display
   - [ ] Test protected routes

2. **Backend Checks**
   - [ ] Test API health endpoint: `https://api.AIContractCheck.workers.dev/health`
   - [ ] Verify OAuth callback handling
   - [ ] Check KV storage functionality
   - [ ] Test JWT token generation and validation

## Troubleshooting

1. **CORS Issues**
   - Verify the frontend URL is correctly set in backend environment
   - Check CORS configuration in `index.ts`

2. **OAuth Errors**
   - Confirm redirect URIs are correct in Google Console
   - Verify client ID and secret are properly set
   - Check environment variables are loaded

3. **KV Storage Issues**
   - Ensure KV namespace bindings are correct in `wrangler.toml`
   - Verify KV namespaces are created in Cloudflare dashboard

## Rollback Procedure

1. **Frontend Rollback**
   ```bash
   cd packages/frontend
   wrangler pages deployment rollback
   ```

2. **Backend Rollback**
   ```bash
   cd packages/backend
   wrangler rollback
