#!/bin/bash

# Not a Label - Quick Deployment Script
# Run this on the production server

set -e

echo "🚀 Starting Not a Label deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update -y

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
echo "📦 Installing system dependencies..."
sudo apt-get install -y git nginx postgresql postgresql-contrib redis-server certbot python3-certbot-nginx

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Clone repository
echo "📂 Cloning repository..."
cd /opt
if [ ! -d "not-a-label" ]; then
    git clone https://github.com/kentin0-fiz0l/not-a-label-v2.git not-a-label
fi
cd not-a-label

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Create .env.production if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo "⚙️ Creating .env.production file..."
    cp .env.example .env.production
    echo "⚠️  Please edit .env.production with your actual values!"
    echo "Press Enter to continue after editing..."
    read
fi

# Generate NEXTAUTH_SECRET if not set
if ! grep -q "NEXTAUTH_SECRET=" .env.production || grep -q "NEXTAUTH_SECRET=$" .env.production; then
    echo "🔐 Generating NEXTAUTH_SECRET..."
    SECRET=$(openssl rand -base64 32)
    sed -i "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$SECRET/" .env.production
fi

# Setup PostgreSQL
echo "🗄️ Setting up PostgreSQL..."
sudo -u postgres psql << EOF
CREATE USER IF NOT EXISTS notalabel WITH PASSWORD 'SecurePass123!';
CREATE DATABASE IF NOT EXISTS notalabel OWNER notalabel;
GRANT ALL PRIVILEGES ON DATABASE notalabel TO notalabel;
EOF

# Update DATABASE_URL in .env.production
sed -i 's|DATABASE_URL=.*|DATABASE_URL=postgresql://notalabel:SecurePass123!@localhost:5432/notalabel|' .env.production

# Build application
echo "🔨 Building application..."
npm run build

# Run database migrations
echo "🗄️ Running database migrations..."
cd apps/web
npx prisma migrate deploy
cd ../..

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/not-a-label > /dev/null << 'EOF'
server {
    listen 80;
    server_name not-a-label.art www.not-a-label.art;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 100M;
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/not-a-label /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Start Redis
echo "🔴 Starting Redis..."
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Configure firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 delete all || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root | tail -n 1 | bash

# Health check
echo "🏥 Running health check..."
sleep 10
if curl -f http://localhost:3000/api/health; then
    echo "✅ Application is running!"
else
    echo "❌ Health check failed!"
    pm2 logs --lines 50
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set up SSL: sudo certbot --nginx -d not-a-label.art -d www.not-a-label.art"
echo "2. Configure DNS records to point to: $(curl -s ifconfig.me)"
echo "3. Edit /opt/not-a-label/.env.production with your API keys"
echo "4. Create admin account using the instructions in DEPLOYMENT_COMMANDS.md"
echo ""
echo "Monitor logs: pm2 logs"
echo "Check status: pm2 status"