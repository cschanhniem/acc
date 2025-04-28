#!/bin/bash

# Build shared package first
echo "📦 Building shared package..."
cd packages/shared && pnpm build || exit 1

# Build and deploy backend
echo "🚀 Building and deploying backend..."
cd ../backend || exit 1
echo "Building backend..."
pnpm build || exit 1

echo "Deploying backend to Cloudflare Workers..."
DEPLOY_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "Setting DEPLOYED_AT secret..."
echo "$DEPLOY_TIME" | wrangler secret put DEPLOYED_AT --env production || exit 1
echo "Deploying backend..."
wrangler deploy --env production || exit 1

# Build and deploy frontend
echo "🚀 Building and deploying frontend..."
cd ../frontend || exit 1
echo "Building frontend..."
pnpm build || exit 1

echo "Deploying frontend to Cloudflare Pages..."
wrangler pages deploy dist --project-nameAI Contract Check --branch main || exit 1

echo "✅ Deployment complete!"
echo "Frontend: https://AIContractCheck.com"
echo "Backend: https://api.AIContractCheck.com"
