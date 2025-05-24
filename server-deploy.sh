#!/bin/bash

# Server-side deployment script
# Run this on your server after uploading the code

set -e

echo "🚀 Deploying Not a Label V2"
echo "=========================="

# Configuration
DEPLOY_DIR="/root/not-a-label-v2"
GITHUB_REPO="https://github.com/kentin0-fiz0l/not-a-label-v2.git"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Create deployment directory
echo -e "${YELLOW}1. Setting up deployment directory...${NC}"
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# Clone or pull latest code
if [ -d ".git" ]; then
    echo -e "${YELLOW}2. Pulling latest code...${NC}"
    git pull origin main
else
    echo -e "${YELLOW}2. Cloning repository...${NC}"
    git clone $GITHUB_REPO .
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}3. Creating environment file...${NC}"
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

# AI Services (UPDATE THESE!)
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key

# Node Environment
NODE_ENV=production
SECURE_COOKIES=true
CORS_ORIGIN=https://www.not-a-label.art,https://not-a-label.art
EOF
    echo -e "${RED}⚠️  IMPORTANT: Edit .env and add your API keys!${NC}"
    echo "Run: nano .env"
fi

# Install dependencies
echo -e "${YELLOW}4. Installing dependencies...${NC}"
npm install

# Build the application
echo -e "${YELLOW}5. Building application...${NC}"
npm run build

# Stop existing containers
echo -e "${YELLOW}6. Stopping existing containers...${NC}"
docker-compose down || true

# Build Docker images
echo -e "${YELLOW}7. Building Docker images...${NC}"
docker-compose build

# Start services
echo -e "${YELLOW}8. Starting services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}9. Waiting for services to start...${NC}"
sleep 30

# Run database migrations
echo -e "${YELLOW}10. Running database migrations...${NC}"
docker-compose exec -T user-service npx prisma migrate deploy || true
docker-compose exec -T ai-service npx prisma migrate deploy || true

# Check service status
echo -e "${YELLOW}11. Checking service status...${NC}"
docker-compose ps

# Set up SSL if needed
if [ ! -f "/etc/letsencrypt/live/not-a-label.art/fullchain.pem" ]; then
    echo -e "${YELLOW}12. Setting up SSL certificates...${NC}"
    if [ -f "./setup-ssl.sh" ]; then
        chmod +x setup-ssl.sh
        ./setup-ssl.sh
    fi
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Your application is now running at:"
echo "  - Website: https://www.not-a-label.art"
echo "  - API: https://api.not-a-label.art"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To restart services:"
echo "  docker-compose restart"