#!/bin/bash

# DigitalOcean Deployment Script for Not a Label
# This script deploys the application to a DigitalOcean droplet

set -e

# Configuration
DROPLET_IP="146.190.205.102"
DROPLET_USER="root"
APP_DIR="/opt/not-a-label"
BACKUP_DIR="/opt/backups"

echo "🚀 Starting DigitalOcean deployment for Not a Label..."

# Function to check SSH connectivity
check_ssh() {
    echo "🔍 Checking SSH connectivity to $DROPLET_IP..."
    
    if ssh -o ConnectTimeout=5 -o BatchMode=yes $DROPLET_USER@$DROPLET_IP exit 2>/dev/null; then
        echo "✅ SSH connection successful!"
        return 0
    else
        echo "❌ SSH connection failed!"
        echo ""
        echo "Alternative deployment methods:"
        echo "1. Use DigitalOcean Console:"
        echo "   - Log into DigitalOcean dashboard"
        echo "   - Navigate to your droplet"
        echo "   - Click 'Access' → 'Launch Droplet Console'"
        echo ""
        echo "2. Try password authentication:"
        echo "   ssh $DROPLET_USER@$DROPLET_IP"
        echo ""
        echo "3. Check firewall rules:"
        echo "   - Ensure port 22 is open"
        echo "   - Check ufw status on the droplet"
        return 1
    fi
}

# Function to deploy via SSH
deploy_via_ssh() {
    echo "📦 Deploying to DigitalOcean droplet..."
    
    # Create deployment script
    cat << 'DEPLOY_SCRIPT' > /tmp/deploy-on-droplet.sh
#!/bin/bash
set -e

APP_DIR="/opt/not-a-label"
BACKUP_DIR="/opt/backups"

# Create backup
echo "📁 Creating backup..."
mkdir -p $BACKUP_DIR
if [ -d "$APP_DIR" ]; then
    tar -czf "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C /opt not-a-label
fi

# Update application
echo "🔄 Updating application..."
cd $APP_DIR

# Pull latest changes
git fetch origin main
git reset --hard origin/main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Run database migrations
echo "🗄️ Running database migrations..."
cd $APP_DIR/apps/api
npx prisma migrate deploy || true

# Restart services
echo "🔄 Restarting services..."
cd $APP_DIR

# Stop existing services
docker-compose down || true

# Start services with Docker Compose
docker-compose up -d

# Alternative: Use PM2 if Docker is not available
if ! command -v docker &> /dev/null; then
    echo "🔧 Docker not found, using PM2..."
    pm2 delete all || true
    npm run start:prod
fi

echo "✅ Deployment complete!"
DEPLOY_SCRIPT

    # Copy and execute deployment script
    scp /tmp/deploy-on-droplet.sh $DROPLET_USER@$DROPLET_IP:/tmp/
    ssh $DROPLET_USER@$DROPLET_IP "chmod +x /tmp/deploy-on-droplet.sh && /tmp/deploy-on-droplet.sh"
    
    # Clean up
    rm /tmp/deploy-on-droplet.sh
}

# Function to deploy via DigitalOcean Console commands
generate_console_commands() {
    echo "📝 Manual deployment commands for DigitalOcean Console:"
    echo ""
    echo "Copy and paste these commands into the DigitalOcean Console:"
    echo ""
    cat << 'EOF'
# 1. Navigate to application directory
cd /opt/not-a-label

# 2. Create backup
mkdir -p /opt/backups
tar -czf "/opt/backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C /opt not-a-label

# 3. Update application
git fetch origin main
git reset --hard origin/main

# 4. Install dependencies
npm install

# 5. Build application
npm run build

# 6. Run database migrations
cd /opt/not-a-label/apps/api
npx prisma migrate deploy

# 7. Restart services
cd /opt/not-a-label
docker-compose down
docker-compose up -d

# Alternative: If using PM2
pm2 restart all

# 8. Check service status
docker-compose ps
# or
pm2 status

# 9. View logs
docker-compose logs -f --tail=100
# or
pm2 logs
EOF
}

# Main deployment flow
echo "🔐 Attempting deployment to DigitalOcean..."

if check_ssh; then
    deploy_via_ssh
    
    echo ""
    echo "🌐 Application URLs:"
    echo "   Main: https://not-a-label.art"
    echo "   Alt:  https://www.not-a-label.art"
    echo "   IP:   http://$DROPLET_IP"
    
    echo ""
    echo "📊 Check deployment status:"
    echo "   ssh $DROPLET_USER@$DROPLET_IP 'cd $APP_DIR && docker-compose ps'"
    echo "   ssh $DROPLET_USER@$DROPLET_IP 'pm2 status'"
else
    echo ""
    echo "⚠️  SSH connection failed. Generating manual deployment instructions..."
    echo ""
    generate_console_commands
    
    echo ""
    echo "💡 After manual deployment, verify services:"
    echo "   - Check nginx: systemctl status nginx"
    echo "   - Check Docker: docker ps"
    echo "   - Check PM2: pm2 status"
    echo "   - Check logs: journalctl -u nginx -f"
fi

echo ""
echo "🔧 Troubleshooting:"
echo "   - SSH issues: ./ssh-recovery.sh"
echo "   - Service logs: docker-compose logs"
echo "   - Nginx logs: /var/log/nginx/error.log"
echo "   - App logs: pm2 logs"