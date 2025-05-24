#!/bin/bash

# SSL Certificate Setup Script using Let's Encrypt
# Run this on your production server

set -e

echo "🔐 Setting up SSL certificates for Not a Label"
echo "============================================="

# Configuration
DOMAIN="not-a-label.art"
API_DOMAIN="api.not-a-label.art"
EMAIL="${CERTBOT_EMAIL:-hello@not-a-label.art}"

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Stop nginx temporarily
docker-compose stop nginx || true

# Get certificates
echo "Obtaining SSL certificates..."
certbot certonly --standalone \
    -d ${DOMAIN} \
    -d www.${DOMAIN} \
    -d ${API_DOMAIN} \
    --non-interactive \
    --agree-tos \
    --email ${EMAIL} \
    --redirect \
    --expand

# Create directory for SSL certs in project
mkdir -p /root/not-a-label-v2/infrastructure/nginx/ssl

# Copy certificates
cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem /root/not-a-label-v2/infrastructure/nginx/ssl/
cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem /root/not-a-label-v2/infrastructure/nginx/ssl/

# Set proper permissions
chmod 644 /root/not-a-label-v2/infrastructure/nginx/ssl/fullchain.pem
chmod 600 /root/not-a-label-v2/infrastructure/nginx/ssl/privkey.pem

# Restart nginx
cd /root/not-a-label-v2
docker-compose up -d nginx

# Setup auto-renewal
echo "Setting up auto-renewal..."
cat > /etc/cron.d/certbot-renewal << EOF
0 2 * * * root certbot renew --quiet --post-hook "cd /root/not-a-label-v2 && docker-compose restart nginx"
EOF

echo "✅ SSL certificates installed successfully!"
echo ""
echo "Certificates are valid for:"
echo "  - ${DOMAIN}"
echo "  - www.${DOMAIN}"
echo "  - ${API_DOMAIN}"
echo ""
echo "Auto-renewal is configured via cron."