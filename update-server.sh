#!/bin/bash

# Deploy enhanced UX/UI updates to DigitalOcean server
set -e

echo "=== Deploying Enhanced UX/UI Updates ==="

# Build locally first to check for errors
echo "Building locally to verify..."
cd apps/web
npm run build
cd ../..

# Push to GitHub
echo "Pushing to GitHub..."
git add .
git commit -m "Enhanced onboarding flow and UX/UI improvements

- Added comprehensive multi-step onboarding wizard
- Enhanced authentication with password recovery and social login
- Improved dashboard with empty states and progress indicators  
- Added navigation components (breadcrumbs, user menu)
- Enhanced visual design with animations and micro-interactions
- Created new UI components (Progress, Stepper, Select, etc.)

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin master

echo "=== Server Deployment Commands ==="
echo "Run these commands on your DigitalOcean server:"
echo ""
echo "# 1. Pull latest changes"
echo "cd /root/not-a-label-standalone"
echo "git pull"
echo ""
echo "# 2. Rebuild the application" 
echo "npm run build"
echo ""
echo "# 3. Restart PM2"
echo "pm2 restart not-a-label"
echo ""
echo "# 4. Check status"
echo "pm2 status"
echo "pm2 logs --lines 20"
echo ""
echo "=== Or run this one-liner ==="
echo 'cd /root/not-a-label-standalone && git pull && npm run build && pm2 restart not-a-label && pm2 status'
echo ""
echo "✅ Your enhanced platform will be live at https://www.not-a-label.art"