#!/bin/bash

# Direct deployment without GitHub
echo "🚀 Direct deployment to Not a Label server"
echo "========================================"

# Create archive
echo "Creating deployment archive..."
tar -czf deploy-direct.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=dist \
    --exclude=*.log \
    --exclude=deploy-direct.tar.gz \
    .

echo "Archive created. Now you can:"
echo ""
echo "1. Upload to server:"
echo "   scp deploy-direct.tar.gz root@146.190.205.102:/root/"
echo ""
echo "2. SSH to server and extract:"
echo "   ssh root@146.190.205.102"
echo "   cd /root"
echo "   mkdir -p not-a-label-v2"
echo "   cd not-a-label-v2"
echo "   tar -xzf ../deploy-direct.tar.gz"
echo "   cp .env.production.server .env"
echo ""
echo "3. Deploy:"
echo "   npm install"
echo "   npm run build"
echo "   docker-compose up -d"

echo ""
echo "Or run: ./deploy-to-server.sh to do this automatically"