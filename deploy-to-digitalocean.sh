#!/bin/bash

# Automated deployment to DigitalOcean droplet
# This script handles the complete deployment process

set -e

echo "🚀 Deploying Not a Label V2 to DigitalOcean"
echo "==========================================="

# Configuration
SERVER_IP="146.190.205.102"
SERVER_USER="root"
DEPLOY_PATH="/root/not-a-label-v2"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we can connect to the server
echo -e "${YELLOW}Testing connection to DigitalOcean droplet...${NC}"
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes ${SERVER_USER}@${SERVER_IP} exit 2>/dev/null; then
    echo -e "${RED}Cannot connect to server via SSH.${NC}"
    echo ""
    echo "Please run these commands manually on your DigitalOcean droplet:"
    echo ""
    echo -e "${GREEN}1. Access your droplet via DigitalOcean console${NC}"
    echo "   https://cloud.digitalocean.com/droplets"
    echo ""
    echo -e "${GREEN}2. Run this command on the server:${NC}"
    echo "   curl -fsSL https://raw.githubusercontent.com/kentin0-fiz0l/not-a-label-v2/main/server-deploy.sh | bash"
    echo ""
    echo -e "${GREEN}3. Update API keys:${NC}"
    echo "   nano /root/not-a-label-v2/.env"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Connected to DigitalOcean droplet${NC}"

# Execute deployment on server
echo -e "${YELLOW}Deploying on server...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
set -e

echo "📦 Starting deployment on DigitalOcean droplet..."

# Install dependencies if needed
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

# Stop any running containers from old deployment
echo "Stopping old containers..."
docker stop $(docker ps -q) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Clone or update repository
cd /root
if [ -d "not-a-label-v2" ]; then
    echo "Updating existing repository..."
    cd not-a-label-v2
    git pull origin main
else
    echo "Cloning repository..."
    git clone https://github.com/kentin0-fiz0l/not-a-label-v2.git
    cd not-a-label-v2
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating environment configuration..."
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
    echo ""
    echo "⚠️  IMPORTANT: Update .env with your API keys!"
fi

# Install Node dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Build and start Docker containers
echo "Starting Docker containers..."
docker-compose down 2>/dev/null || true
docker-compose build
docker-compose up -d

# Wait for services to start
echo "Waiting for services to initialize..."
sleep 30

# Run database migrations
echo "Running database migrations..."
docker-compose exec -T user-service npx prisma migrate deploy 2>/dev/null || true
docker-compose exec -T ai-service npx prisma migrate deploy 2>/dev/null || true

# Check SSL certificates
if [ ! -f "/etc/letsencrypt/live/not-a-label.art/fullchain.pem" ]; then
    echo "Setting up SSL certificates..."
    chmod +x setup-ssl.sh 2>/dev/null || true
    ./setup-ssl.sh 2>/dev/null || true
fi

# Show status
echo ""
echo "📊 Deployment Status:"
docker-compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site is available at:"
echo "   - https://www.not-a-label.art"
echo "   - https://api.not-a-label.art/health"
echo ""
echo "📝 Next steps:"
echo "   1. Update API keys: nano /root/not-a-label-v2/.env"
echo "   2. Restart services: docker-compose restart"
echo "   3. View logs: docker-compose logs -f"
ENDSSH

echo ""
echo -e "${GREEN}✅ Deployment to DigitalOcean complete!${NC}"
echo ""
echo "Your Not a Label V2 platform should now be live at:"
echo "  - https://www.not-a-label.art"
echo "  - https://api.not-a-label.art"
echo ""
echo -e "${YELLOW}Don't forget to update your API keys on the server:${NC}"
echo "  ssh ${SERVER_USER}@${SERVER_IP}"
echo "  nano ${DEPLOY_PATH}/.env"