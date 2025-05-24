#!/bin/bash

# Fix workspace deployment issues on DigitalOcean server
# This script handles npm workspace dependencies properly

set -e

echo "=== Fixing Not a Label v2 Workspace Deployment ==="

# Navigate to the project root
cd /root/not-a-label-v2

# Clean up any existing node_modules and lock files
echo "Cleaning up existing dependencies..."
rm -rf node_modules package-lock.json
rm -rf apps/web/node_modules apps/web/package-lock.json
rm -rf packages/*/node_modules packages/*/package-lock.json
rm -rf services/*/node_modules services/*/package-lock.json

# Install all dependencies from root (supports workspaces)
echo "Installing dependencies from root with workspace support..."
npm install --legacy-peer-deps

# Build the web application
echo "Building the web application..."
npm run build --workspace=apps/web

# Create production deployment directory
echo "Creating production deployment..."
mkdir -p /var/www/not-a-label

# Copy built files
cp -r apps/web/.next /var/www/not-a-label/
cp -r apps/web/public /var/www/not-a-label/
cp apps/web/package.json /var/www/not-a-label/
cp apps/web/next.config.js /var/www/not-a-label/ 2>/dev/null || true

# Copy environment file
cp .env.production.server /var/www/not-a-label/.env.production

# Install production dependencies only in deployment directory
cd /var/www/not-a-label
cat > package.json << 'EOF'
{
  "name": "not-a-label-production",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "start": "NODE_ENV=production node_modules/.bin/next start -p 3000"
  },
  "dependencies": {
    "next": "^15.3.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-auth": "^4.24.5",
    "next-themes": "^0.2.1",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0",
    "react-hot-toast": "^2.4.1",
    "tailwind-merge": "^2.1.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
EOF

npm install --production --legacy-peer-deps

# Setup PM2 for process management
echo "Setting up PM2..."
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'not-a-label',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/not-a-label',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/not-a-label/error.log',
    out_file: '/var/log/not-a-label/out.log',
    merge_logs: true,
    time: true
  }]
};
EOF

# Create log directory
mkdir -p /var/log/not-a-label

# Stop any existing PM2 processes
pm2 stop not-a-label 2>/dev/null || true
pm2 delete not-a-label 2>/dev/null || true

# Start the application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

# Setup Nginx if not already configured
if [ ! -f /etc/nginx/sites-available/not-a-label ]; then
    echo "Setting up Nginx..."
    cat > /etc/nginx/sites-available/not-a-label << 'NGINX_EOF'
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
}
NGINX_EOF

    ln -sf /etc/nginx/sites-available/not-a-label /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
fi

# Install SSL certificate with Certbot
if [ ! -d /etc/letsencrypt/live/not-a-label.art ]; then
    echo "Setting up SSL certificate..."
    certbot --nginx -d not-a-label.art -d www.not-a-label.art --non-interactive --agree-tos --email admin@not-a-label.art
fi

echo "=== Deployment Complete ==="
echo "Application running at: https://www.not-a-label.art"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check application status"
echo "  pm2 logs            - View application logs"
echo "  pm2 restart all     - Restart application"
echo ""