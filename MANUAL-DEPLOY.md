# Manual Deployment Instructions

Since SSH is not working from the script, follow these manual steps:

## Step 1: Create Deployment Archive

Run this on your local machine:
```bash
cd "/Users/kentino/Not a Label/not-a-label-v2"
tar -czf deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=dist \
    --exclude=.env \
    --exclude=*.log \
    --exclude=deploy.tar.gz \
    .
```

## Step 2: Upload to Server

Use your preferred method (FTP, SCP, or cloud storage) to upload `deploy.tar.gz` to your server.

If SSH works manually:
```bash
scp deploy.tar.gz root@146.190.205.102:/root/
```

## Step 3: Connect to Server and Deploy

SSH into your server:
```bash
ssh root@146.190.205.102
```

Then run these commands:
```bash
# Create directory
cd /root
mkdir -p not-a-label-v2
cd not-a-label-v2

# Backup current deployment (if exists)
if [ -d "current" ]; then
    mv current backup-$(date +%Y%m%d-%H%M%S)
fi

# Extract new deployment
mkdir current
cd current
tar -xzf /root/deploy.tar.gz

# Create .env file
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

# Add your API keys here:
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Node Environment
NODE_ENV=production
EOF

# Install dependencies
npm install

# Build the application
npm run build

# Stop any existing containers
docker-compose down || true

# Build and start Docker containers
docker-compose build
docker-compose up -d

# Wait for services
sleep 30

# Check status
docker-compose ps
```

## Step 4: Set Up SSL (if needed)

If SSL is not set up:
```bash
cd /root/not-a-label-v2/current
chmod +x setup-ssl.sh
./setup-ssl.sh
```

## Step 5: Verify Deployment

1. Check if services are running:
   ```bash
   docker-compose ps
   ```

2. Check logs:
   ```bash
   docker-compose logs -f
   ```

3. Visit your site:
   - https://www.not-a-label.art
   - https://api.not-a-label.art/health

## Troubleshooting

If services aren't starting:
```bash
# Check individual service logs
docker-compose logs web
docker-compose logs api-gateway
docker-compose logs user-service

# Restart services
docker-compose restart

# Check disk space
df -h

# Check memory
free -h
```

## Quick Commands

View logs:
```bash
docker-compose logs -f [service-name]
```

Restart all services:
```bash
docker-compose restart
```

Stop all services:
```bash
docker-compose down
```

Start all services:
```bash
docker-compose up -d
```