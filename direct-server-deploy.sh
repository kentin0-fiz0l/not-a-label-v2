#!/bin/bash

# Direct deployment script for Not a Label V2
# Run this directly on your server

set -e

echo "🚀 Deploying Not a Label V2"
echo "=========================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Install dependencies if needed
echo -e "${YELLOW}Checking dependencies...${NC}"

if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | bash
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    apt update
    apt install -y docker-compose
fi

if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    apt install -y git
fi

# Stop old containers
echo -e "${YELLOW}Cleaning up old deployment...${NC}"
docker stop $(docker ps -q) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Clone repository
echo -e "${YELLOW}Cloning repository...${NC}"
cd /root
rm -rf not-a-label-v2
git clone https://github.com/kentin0-fiz0l/not-a-label-v2.git
cd not-a-label-v2

# Create .env file
echo -e "${YELLOW}Creating environment configuration...${NC}"
cat > .env << 'EOF'
# Database
POSTGRES_PASSWORD=NAL-v2-Pr0d-2024!SecureDB
DATABASE_URL=postgresql://notalabel:NAL-v2-Pr0d-2024!SecureDB@postgres:5432/notalabel

# JWT & Auth
JWT_SECRET=NAL-v2-jwt-s3cr3t-2024-pr0duct10n-k3y-very-l0ng-and-s3cur3
NEXTAUTH_SECRET=NAL-v2-n3xtauth-s3cr3t-2024-pr0d-k3y-sup3r-s3cur3-rand0m
NEXTAUTH_URL=https://www.not-a-label.art

# API Configuration
API_URL=https://api.not-a-label.art

# Service URLs
USER_SERVICE_URL=http://user-service:3002
MUSIC_SERVICE_URL=http://music-service:3003
AI_SERVICE_URL=http://ai-service:3004
ANALYTICS_SERVICE_URL=http://analytics-service:3005
DISTRIBUTION_SERVICE_URL=http://distribution-service:3006
NOTIFICATION_SERVICE_URL=http://notification-service:3007
PAYMENT_SERVICE_URL=http://payment-service:3008

# Redis
REDIS_URL=redis://redis:6379

# AI Services - UPDATE THESE!
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key

# Production settings
NODE_ENV=production
SECURE_COOKIES=true
CORS_ORIGIN=https://www.not-a-label.art,https://not-a-label.art
EOF

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Build application
echo -e "${YELLOW}Building application...${NC}"
npm run build

# Start Docker containers
echo -e "${YELLOW}Starting Docker containers...${NC}"
docker-compose build
docker-compose up -d

# Wait for services
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 30

# Check status
echo -e "${GREEN}Deployment Status:${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Your site should be available at:"
echo "  - https://www.not-a-label.art"
echo "  - https://api.not-a-label.art/health"
echo ""
echo -e "${RED}IMPORTANT: Update your API keys!${NC}"
echo "Run: nano /root/not-a-label-v2/.env"
echo "Then restart: cd /root/not-a-label-v2 && docker-compose restart"