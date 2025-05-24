#!/bin/bash

# Not a Label - Quick Setup Script
# This script sets up the development environment quickly

set -e

echo "🎵 Not a Label - Quick Setup"
echo "============================="
echo ""

# Check for required tools
echo "📋 Checking requirements..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    echo "   Visit: https://git-scm.com/"
    exit 1
fi

echo "✅ All requirements met!"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo ""
    echo "🔧 Setting up environment variables..."
    cat > .env.local << EOL
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/notalabel"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AI Services (Optional - works without these)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""

# Email (Optional)
EMAIL_FROM="noreply@localhost"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER=""
EMAIL_PASS=""
EOL
    echo "✅ Created .env.local file"
    echo "⚠️  Please update the environment variables in .env.local"
else
    echo "✅ Environment file already exists"
fi

# Database setup
echo ""
echo "🗄️  Database Setup"
echo "=================="
echo ""
echo "Option 1: Use Docker (Recommended)"
echo "  docker run --name notalabel-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=notalabel -p 5432:5432 -d postgres"
echo ""
echo "Option 2: Use existing PostgreSQL"
echo "  Update DATABASE_URL in .env.local"
echo ""
read -p "Press Enter to continue..."

# Build the project
echo ""
echo "🔨 Building the project..."
npm run build

echo ""
echo "✨ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "📱 The app will be available at:"
echo "   http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - README.md for overview"
echo "   - DEPLOYMENT.md for production deployment"
echo "   - CLAUDE.md for AI assistance guidelines"
echo ""
echo "Happy coding! 🎵"