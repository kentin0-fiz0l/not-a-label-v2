#!/bin/bash

# Not a Label V2 - Production Deployment Script
# This script deploys the platform to your DigitalOcean server

set -e

echo "🚀 Not a Label V2 - Production Deployment"
echo "========================================"

# Configuration
SERVER_IP="${SERVER_IP:-146.190.205.102}"
SERVER_USER="${SERVER_USER:-root}"
DOMAIN="not-a-label.art"
DEPLOY_PATH="/root/not-a-label-v2"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please create .env file from .env.example"
    exit 1
fi

echo -e "${YELLOW}1. Building Docker images locally...${NC}"
docker-compose build

echo -e "${YELLOW}2. Creating deployment package...${NC}"
# Create a deployment directory
mkdir -p deployment-package
cp -r docker-compose.yml deployment-package/
cp -r infrastructure deployment-package/
cp .env deployment-package/
cp -r services/*/prisma deployment-package/ 2>/dev/null || true

# Create deployment archive
tar -czf deployment-package.tar.gz deployment-package
rm -rf deployment-package

echo -e "${YELLOW}3. Uploading to server...${NC}"
scp deployment-package.tar.gz ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/
rm deployment-package.tar.gz

echo -e "${YELLOW}4. Deploying on server...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /root/not-a-label-v2

# Extract deployment package
tar -xzf deployment-package.tar.gz
cp -r deployment-package/* .
rm -rf deployment-package deployment-package.tar.gz

# Stop existing containers
docker-compose down || true

# Pull latest images
docker-compose pull

# Run database migrations
docker-compose run --rm user-service npx prisma migrate deploy
docker-compose run --rm ai-service npx prisma migrate deploy

# Start services
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 30

# Check service health
docker-compose ps

# Clean up old images
docker system prune -f

echo "✅ Deployment complete!"
ENDSSH

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo "Your application is now running at:"
echo "  - Web: https://${DOMAIN}"
echo "  - API: https://api.${DOMAIN}"
echo ""
echo "To check logs:"
echo "  ssh ${SERVER_USER}@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker-compose logs -f'"