#!/bin/bash

# Automated Server Setup Script for Not a Label
# This script automates the complete server setup process

set -e  # Exit on error

# Configuration
DOMAIN="not-a-label.art"
APP_DIR="/opt/not-a-label"
NODE_VERSION="20"
GITHUB_REPO="https://github.com/kentin0-fiz0l/not-a-label-v2.git"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

log "Starting Not a Label server setup..."

# Update system
log "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
log "Installing essential packages..."
apt install -y curl git build-essential nginx postgresql postgresql-contrib redis-server certbot python3-certbot-nginx ufw fail2ban

# Install Node.js
log "Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs

# Install PM2
log "Installing PM2..."
npm install -g pm2

# Setup PostgreSQL
log "Setting up PostgreSQL..."
sudo -u postgres psql << EOF
CREATE USER notalabel WITH PASSWORD 'SecurePass123!';
CREATE DATABASE notalabel OWNER notalabel;
GRANT ALL PRIVILEGES ON DATABASE notalabel TO notalabel;
EOF

# Configure Redis
log "Configuring Redis..."
sed -i 's/^# requirepass .*/requirepass SecureRedisPass123!/' /etc/redis/redis.conf
systemctl restart redis

# Create application directory
log "Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository
log "Cloning repository..."
if [ -d "$APP_DIR/.git" ]; then
    log "Repository already exists, pulling latest changes..."
    git pull origin main
else
    git clone $GITHUB_REPO .
fi

# Create environment file
log "Creating environment file..."
cat > $APP_DIR/.env.production << EOF
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://${DOMAIN}
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api

# Authentication
NEXTAUTH_URL=https://${DOMAIN}
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Database
DATABASE_URL=postgresql://notalabel:SecurePass123!@localhost:5432/notalabel

# Redis
REDIS_URL=redis://:SecureRedisPass123!@localhost:6379

# Email (configure with your SMTP details)
EMAIL_FROM=noreply@${DOMAIN}
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=

# AI Services (add your API keys)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
REPLICATE_API_TOKEN=

# File Storage
UPLOAD_DIR=/opt/not-a-label/uploads
MAX_FILE_SIZE=52428800

# Analytics
GOOGLE_ANALYTICS_ID=
MIXPANEL_TOKEN=

# Payment (add your keys)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
EOF

# Install dependencies
log "Installing dependencies..."
npm install

# Build application
log "Building application..."
npm run build

# Setup PM2
log "Setting up PM2..."
cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'not-a-label',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/opt/not-a-label',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/not-a-label-error.log',
    out_file: '/var/log/pm2/not-a-label-out.log',
    log_file: '/var/log/pm2/not-a-label-combined.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git', 'uploads'],
    autorestart: true,
    restart_delay: 5000
  }]
};
EOF

# Start application with PM2
log "Starting application..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

# Configure Nginx
log "Configuring Nginx..."
cat > /etc/nginx/sites-available/not-a-label << EOF
# Rate limiting
limit_req_zone \$binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=api:10m rate=5r/s;
limit_req_zone \$binary_remote_addr zone=auth:10m rate=2r/s;

# Upstream application
upstream not-a-label {
    server localhost:3000;
    keepalive 64;
}

# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    # SSL configuration (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Client settings
    client_max_body_size 50M;
    client_body_timeout 60s;
    client_header_timeout 60s;

    # Proxy settings
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    proxy_buffering off;
    proxy_request_buffering off;

    # Static files
    location /_next/static {
        alias /opt/not-a-label/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /uploads {
        alias /opt/not-a-label/uploads;
        expires 1d;
        add_header Cache-Control "public";
    }

    # API routes with stricter rate limiting
    location /api/auth {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://not-a-label;
    }

    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://not-a-label;
    }

    # Main application
    location / {
        limit_req zone=general burst=20 nodelay;
        proxy_pass http://not-a-label;
    }
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/not-a-label /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Setup SSL
log "Setting up SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

# Configure firewall
log "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Setup fail2ban
log "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
filter = nginx-noproxy
logpath = /var/log/nginx/access.log
maxretry = 2
EOF

systemctl restart fail2ban

# Create backup script
log "Creating backup script..."
cat > /opt/not-a-label/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/not-a-label"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U notalabel notalabel > $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz /opt/not-a-label/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
EOF

chmod +x /opt/not-a-label/backup.sh

# Setup cron for backups
log "Setting up automated backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/not-a-label/backup.sh >> /var/log/not-a-label-backup.log 2>&1") | crontab -

# Create monitoring script
log "Creating monitoring script..."
cat > /opt/not-a-label/monitor.sh << 'EOF'
#!/bin/bash
# Simple monitoring script

check_service() {
    if systemctl is-active --quiet $1; then
        echo "$1: Running"
    else
        echo "$1: Not running - Restarting..."
        systemctl restart $1
    fi
}

echo "=== Not a Label Monitor ==="
echo "Time: $(date)"
echo ""

# Check services
check_service nginx
check_service postgresql
check_service redis

# Check PM2
if pm2 list | grep -q "not-a-label"; then
    echo "PM2 App: Running"
else
    echo "PM2 App: Not running - Restarting..."
    cd /opt/not-a-label && pm2 start ecosystem.config.js
fi

# Check disk space
df -h | grep -E "^/dev/"

echo ""
echo "=========================="
EOF

chmod +x /opt/not-a-label/monitor.sh

# Add monitoring to cron
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/not-a-label/monitor.sh >> /var/log/not-a-label-monitor.log 2>&1") | crontab -

# Final setup
log "Finalizing setup..."

# Create uploads directory
mkdir -p /opt/not-a-label/uploads
chown -R www-data:www-data /opt/not-a-label/uploads

# Set proper permissions
chown -R root:root /opt/not-a-label
chmod -R 755 /opt/not-a-label

success "Server setup completed!"
echo ""
echo "==================================="
echo "Not a Label Production Server Ready"
echo "==================================="
echo "Domain: https://$DOMAIN"
echo "PM2 Status: pm2 status"
echo "Logs: pm2 logs not-a-label"
echo "Monitor: /opt/not-a-label/monitor.sh"
echo "Backup: /opt/not-a-label/backup.sh"
echo ""
echo "Next steps:"
echo "1. Update .env.production with your API keys"
echo "2. Add GitHub Actions SSH key to authorized_keys"
echo "3. Test the deployment workflow"
echo "==================================="