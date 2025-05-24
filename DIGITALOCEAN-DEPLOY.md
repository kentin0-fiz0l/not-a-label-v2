# DigitalOcean Deployment for Not a Label V2

## Current Setup
- Server IP: 146.190.205.102
- Domain: not-a-label.art (pointing to this server)
- Server Name: not-a-label-production (DigitalOcean Droplet)

## Deployment Steps for DigitalOcean Droplet

### 1. Access Your Droplet
```bash
ssh root@146.190.205.102
```

Or use the DigitalOcean console if SSH isn't working.

### 2. Prepare the Server (if not already done)
```bash
# Update system
apt update && apt upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | bash
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    apt install docker-compose -y
fi

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y
```

### 3. Deploy Not a Label V2
```bash
# Clone the repository
cd /root
git clone https://github.com/kentin0-fiz0l/not-a-label-v2.git
cd not-a-label-v2

# Create production environment file
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

# Service URLs (internal Docker network)
USER_SERVICE_URL=http://user-service:3002
MUSIC_SERVICE_URL=http://music-service:3003
AI_SERVICE_URL=http://ai-service:3004
ANALYTICS_SERVICE_URL=http://analytics-service:3005
DISTRIBUTION_SERVICE_URL=http://distribution-service:3006
NOTIFICATION_SERVICE_URL=http://notification-service:3007
PAYMENT_SERVICE_URL=http://payment-service:3008

# Redis
REDIS_URL=redis://redis:6379

# IMPORTANT: Add your actual API keys here
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key

# Node Environment
NODE_ENV=production
EOF

# Install dependencies
npm install

# Build the application
npm run build

# Start Docker containers
docker-compose up -d

# Set up SSL
./setup-ssl.sh
```

### 4. Configure Nginx (if using external Nginx)
If you have Nginx installed directly on the droplet (not in Docker):

```bash
# Stop any existing web servers using ports 80/443
systemctl stop nginx || true

# Let Docker handle the web serving
docker-compose up -d
```

### 5. Verify Deployment
```bash
# Check if all services are running
docker-compose ps

# View logs
docker-compose logs -f

# Test endpoints
curl http://localhost:3000  # Frontend
curl http://localhost:3001/health  # API Gateway
```

## DigitalOcean Specific Considerations

### Firewall Rules
Make sure your droplet firewall allows:
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 22 (SSH)

```bash
# If using ufw
ufw allow 80
ufw allow 443
ufw allow 22
ufw enable
```

### Resource Monitoring
Check droplet resources:
```bash
# CPU and Memory
htop

# Disk space
df -h

# Docker resource usage
docker stats
```

### Backup Strategy
1. Enable DigitalOcean automatic backups in the droplet settings
2. Create manual snapshots before major updates

### Scaling Options
If you need more resources:
1. Resize the droplet (requires restart)
2. Add load balancer for horizontal scaling
3. Use DigitalOcean Managed Database for PostgreSQL

## Troubleshooting

### If the old site is still showing:
```bash
# Stop old containers
docker ps -a  # List all containers
docker stop $(docker ps -aq)  # Stop all
docker rm $(docker ps -aq)    # Remove all

# Remove old images
docker system prune -a

# Redeploy
cd /root/not-a-label-v2
docker-compose up -d
```

### Check what's using ports:
```bash
lsof -i :80
lsof -i :443
lsof -i :3000
```

## Quick Commands

Deploy from scratch:
```bash
curl -fsSL https://raw.githubusercontent.com/kentin0-fiz0l/not-a-label-v2/main/server-deploy.sh | bash
```

Update deployment:
```bash
cd /root/not-a-label-v2
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

View status:
```bash
cd /root/not-a-label-v2
docker-compose ps
docker-compose logs -f
```