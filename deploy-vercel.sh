#!/bin/bash

# Deploy to Vercel Script
# This script handles deployment to Vercel with proper environment setup

set -e

echo "🚀 Starting Vercel deployment for Not a Label..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Build the project locally first to catch errors
echo "🔨 Building project locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "📦 Deploying to Vercel..."

# For production deployment
if [ "$1" == "production" ]; then
    echo "🌟 Deploying to production..."
    vercel --prod
else
    echo "🧪 Deploying to preview..."
    vercel
fi

echo "✅ Deployment complete!"
echo ""
echo "📌 Next steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Configure custom domain (not-a-label.art)"
echo "3. Set up database connections"
echo "4. Configure Redis for caching"
echo "5. Set up monitoring and analytics"