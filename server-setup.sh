#!/bin/bash

# Not a Label - Server Setup Script
# Run this on a fresh Ubuntu server to set up the application

set -e

echo "🚀 Not a Label Server Setup"
echo "=========================="
echo ""

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "🔧 Installing required packages..."
apt install -y \
    curl \
    git \
    nginx \
    postgresql \
    postgresql-contrib \
    redis-server \
    build-essential \
    python3-pip \
    ufw \
    certbot \
    python3-certbot-nginx

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
echo "🔧 Installing PM2..."
npm install -g pm2

# Install Docker (optional, for Docker deployment)
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com | bash
apt install -y docker-compose

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /opt/not-a-label
cd /opt/not-a-label

# Clone repository
echo "📥 Cloning repository..."
git clone https://github.com/kentin0-fiz0l/not-a-label-v2.git .

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up PostgreSQL
echo "🗄️ Setting up PostgreSQL..."
sudo -u postgres psql << EOF
CREATE USER notalabel WITH PASSWORD 'changeme123';
CREATE DATABASE notalabel OWNER notalabel;
GRANT ALL PRIVILEGES ON DATABASE notalabel TO notalabel;
EOF

# Set up Redis
echo "🔧 Configuring Redis..."
sed -i 's/# requirepass foobared/requirepass changeme456/' /etc/redis/redis.conf
systemctl restart redis-server

# Create environment file
echo "📝 Creating environment file..."
cat > .env.production << 'EOF'
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://not-a-label.art
NEXT_PUBLIC_API_URL=https://not-a-label.art/api
NEXTAUTH_URL=https://not-a-label.art

# Database
DATABASE_URL=postgresql://notalabel:changeme123@localhost:5432/notalabel

# Redis
REDIS_URL=redis://default:changeme456@localhost:6379

# Authentication (CHANGE THESE!)
NEXTAUTH_SECRET=changeme_use_openssl_rand_base64_32
JWT_SECRET=changeme_another_secret_here

# AI Services (Add your keys)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Payments (Add your keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email
EMAIL_FROM=noreply@not-a-label.art
EOF

# Build application
echo "🔨 Building application..."
npm run build

# Set up Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/not-a-label << 'EOF'
server {
    listen 80;
    server_name not-a-label.art www.not-a-label.art;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 100M;
}
EOF

ln -sf /etc/nginx/sites-available/not-a-label /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Set up firewall
echo "🔒 Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Create PM2 ecosystem file
echo "📝 Creating PM2 ecosystem file..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'not-a-label-web',
      script: 'npm',
      args: 'run start:web',
      cwd: '/opt/not-a-label',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'not-a-label-api',
      script: 'npm',
      args: 'run start:api',
      cwd: '/opt/not-a-label',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};
EOF

# Run database migrations
echo "🗄️ Running database migrations..."
cd apps/api
npx prisma generate
npx prisma migrate deploy
cd ../..

# Start application with PM2
echo "🚀 Starting application..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo "✅ Server setup complete!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Edit /opt/not-a-label/.env.production with your actual values"
echo "2. Change database passwords in PostgreSQL and Redis"
echo "3. Set up SSL certificate:"
echo "   certbot --nginx -d not-a-label.art -d www.not-a-label.art"
echo "4. Point your domain to this server: 147.182.252.146"
echo ""
echo "📊 Check application status:"
echo "   pm2 status"
echo "   pm2 logs"
echo "   systemctl status nginx"
echo ""
echo "🌐 Your application will be available at:"
echo "   http://147.182.252.146"
echo "   https://not-a-label.art (after DNS and SSL setup)"