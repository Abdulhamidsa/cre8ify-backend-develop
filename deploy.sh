#!/bin/bash
echo "📥 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🧱 Building project..."
npm run build

echo "🔁 Restarting PM2..."
pm2 restart cre8ify-backend
