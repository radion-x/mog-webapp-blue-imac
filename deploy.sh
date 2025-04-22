#!/bin/bash

echo "🔁 Pulling latest code from GitHub..."
git pull origin main || { echo "❌ Git pull failed"; exit 1; }

echo "📦 Installing frontend dependencies..."
cd client
npm install || { echo "❌ npm install (client) failed"; exit 1; }

echo "🛠 Building frontend with memory limit..."
NODE_OPTIONS="--max_old_space_size=4096" npm run build || { echo "❌ Build failed"; exit 1; }

echo "📦 Installing backend dependencies..."
cd ../server
npm install || { echo "❌ npm install (server) failed"; exit 1; }

echo "🚀 Restarting PM2 service: mog-api"
pm2 restart mog-api || { echo "❌ PM2 restart failed"; exit 1; }

echo "✅ Deployment complete for mog-api"
