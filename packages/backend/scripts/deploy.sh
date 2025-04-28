#!/bin/bash
set -e

echo "Building shared package..."
cd ../shared && pnpm build

echo "Building backend..."
cd ../backend && pnpm build

echo "Deploying to Cloudflare Workers..."
wrangler deploy --env production
