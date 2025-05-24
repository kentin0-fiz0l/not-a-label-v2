#!/bin/bash

# Push Not a Label V2 to GitHub

set -e

echo "🚀 Pushing Not a Label V2 to GitHub"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${YELLOW}Initializing git repository...${NC}"
    git init
    git branch -M main
fi

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo -e "${YELLOW}Creating .gitignore...${NC}"
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Production
dist/
build/
.next/
out/

# Misc
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
!.env.example
!.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Database
*.db
*.sqlite

# Docker
deployment-package.tar.gz

# Temporary files
*.tmp
*.temp
.cache/

# SSL certificates
infrastructure/nginx/ssl/*
!infrastructure/nginx/ssl/.gitkeep
EOF
fi

# Create SSL directory placeholder
mkdir -p infrastructure/nginx/ssl
touch infrastructure/nginx/ssl/.gitkeep

# Add all files
echo -e "${YELLOW}Adding files to git...${NC}"
git add .

# Commit
echo -e "${YELLOW}Creating commit...${NC}"
git commit -m "feat: Not a Label V2 - Complete platform rearchitecture

- Modern microservices architecture
- Next.js 15 + React 19 frontend
- AI-powered features (career guidance, content generation, analysis)
- Complete authentication system
- Dashboard with analytics
- Docker containerization
- Production-ready deployment scripts
- TypeScript throughout
- Prisma ORM with PostgreSQL

Ready for deployment to https://www.not-a-label.art"

# Check if remote exists
if ! git remote | grep -q origin; then
    echo -e "${YELLOW}Adding GitHub remote...${NC}"
    echo -e "${RED}Please enter your GitHub repository URL:${NC}"
    echo "Example: https://github.com/yourusername/not-a-label-v2.git"
    read -p "Repository URL: " REPO_URL
    git remote add origin "$REPO_URL"
fi

# Push to GitHub
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push -u origin main --force

echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
echo ""
echo "Next steps:"
echo "1. Visit your GitHub repository"
echo "2. Set up GitHub Secrets for deployment:"
echo "   - DOCKER_USERNAME"
echo "   - DOCKER_PASSWORD"
echo "   - SSH_PRIVATE_KEY"
echo "   - SERVER_IP"
echo "3. Run the deployment script: ./deploy-to-server.sh"