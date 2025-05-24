#!/bin/bash

# Deploy Not a Label V2 to Production Server
# This script deploys the entire platform to https://www.not-a-label.art

set -e

echo "🚀 Deploying Not a Label V2 to Production"
echo "========================================="

# Configuration
SERVER_IP="146.190.205.102"
SERVER_USER="root"
DOMAIN="not-a-label.art"
REMOTE_PATH="/root/not-a-label-v2"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}1. Preparing deployment...${NC}"

# Create deployment archive
echo "Creating deployment archive..."
tar -czf deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=dist \
    --exclude=.env \
    --exclude=*.log \
    --exclude=deploy.tar.gz \
    .

echo -e "${YELLOW}2. Uploading to server...${NC}"
scp deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/
rm deploy.tar.gz

echo -e "${YELLOW}3. Deploying on server...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
set -e

cd /root/not-a-label-v2

# Backup current deployment
if [ -d "current" ]; then
    echo "Backing up current deployment..."
    mv current backup-$(date +%Y%m%d-%H%M%S)
fi

# Extract new deployment
mkdir current
cd current
tar -xzf ../deploy.tar.gz
rm ../deploy.tar.gz

# Copy production environment file
if [ -f "../.env.production.server" ]; then
    cp ../.env.production.server .env
else
    echo "WARNING: No .env.production.server file found. Please create one."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Run database migrations
echo "Running database migrations..."
cd services/user-service && npx prisma migrate deploy && cd ../..
cd services/ai-service && npx prisma migrate deploy && cd ../..

# Build and start Docker containers
echo "Starting Docker containers..."
docker-compose down || true
docker-compose build
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Check service health
docker-compose ps

# Set up SSL if needed
if [ ! -f "/etc/letsencrypt/live/not-a-label.art/fullchain.pem" ]; then
    echo "Setting up SSL certificates..."
    ./setup-ssl.sh
fi

echo "✅ Deployment complete!"
ENDSSH

echo -e "${GREEN}✅ Successfully deployed to production!${NC}"
echo ""
echo "Your application is now live at:"
echo "  - Website: https://www.not-a-label.art"
echo "  - API: https://api.not-a-label.art"
echo ""
echo "To check logs:"
echo "  ssh ${SERVER_USER}@${SERVER_IP} 'cd ${REMOTE_PATH}/current && docker-compose logs -f'"