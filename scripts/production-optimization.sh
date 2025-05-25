#!/bin/bash

# Production Optimization Script for Not a Label
# Configures CDN, caching, and performance optimizations

set -e

# Configuration
DOMAIN="not-a-label.art"
CDN_PROVIDER=${CDN_PROVIDER:-"cloudflare"} # cloudflare, aws, azure
ENABLE_BROTLI=${ENABLE_BROTLI:-true}
ENABLE_HTTP2=${ENABLE_HTTP2:-true}
ENABLE_GZIP=${ENABLE_GZIP:-true}

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

log "Starting production optimization for $DOMAIN..."

# 1. Install performance monitoring tools
log "Installing performance monitoring tools..."
apt update
apt install -y htop iotop nethogs sysstat nginx-module-brotli

# 2. Optimize Nginx configuration
log "Optimizing Nginx configuration..."
cat > /etc/nginx/conf.d/performance.conf << 'EOF'
# Performance optimizations
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 65535;
    use epoll;
    multi_accept on;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 1000;
    types_hash_max_size 2048;
    server_tokens off;
    
    # Buffer settings
    client_body_buffer_size 128k;
    client_max_body_size 50m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;
    
    # Timeout settings
    client_header_timeout 3m;
    client_body_timeout 3m;
    send_timeout 3m;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/xml
        image/svg+xml;
    
    # Brotli compression
    brotli on;
    brotli_comp_level 6;
    brotli_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/xml
        image/svg+xml;
    
    # File caching
    open_file_cache max=200000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=5r/s;
    
    # SSL optimization
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
}
EOF

# 3. Configure caching for static assets
log "Setting up static asset caching..."
cat > /etc/nginx/conf.d/caching.conf << 'EOF'
# Static asset caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
    access_log off;
}

# API response caching
location /api/ {
    proxy_cache_path /var/cache/nginx/api levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;
    proxy_cache api_cache;
    proxy_cache_valid 200 302 5m;
    proxy_cache_valid 404 1m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_background_update on;
    proxy_cache_lock on;
    
    add_header X-Cache-Status $upstream_cache_status;
}

# Browser caching headers
location / {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
EOF

# 4. Setup CDN configuration
log "Configuring CDN..."
case $CDN_PROVIDER in
    "cloudflare")
        setup_cloudflare_cdn
        ;;
    "aws")
        setup_aws_cloudfront
        ;;
    "azure")
        setup_azure_cdn
        ;;
    *)
        warning "Unknown CDN provider: $CDN_PROVIDER"
        ;;
esac

setup_cloudflare_cdn() {
    log "Setting up Cloudflare CDN..."
    
    # Create Cloudflare configuration
    cat > /opt/not-a-label/cloudflare-config.json << EOF
{
  "zone_id": "${CLOUDFLARE_ZONE_ID}",
  "domain": "${DOMAIN}",
  "settings": {
    "always_use_https": "on",
    "min_tls_version": "1.2",
    "tls_1_3": "on",
    "automatic_https_rewrites": "on",
    "ssl": "flexible",
    "cache_level": "aggressive",
    "development_mode": "off",
    "minify": {
      "css": "on",
      "html": "on",
      "js": "on"
    },
    "brotli": "on",
    "early_hints": "on"
  }
}
EOF

    if [ -n "${CLOUDFLARE_API_TOKEN}" ]; then
        log "Applying Cloudflare settings via API..."
        # Apply settings using Cloudflare API
        curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/always_use_https" \
             -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
             -H "Content-Type: application/json" \
             --data '{"value":"on"}'
    fi
}

setup_aws_cloudfront() {
    log "Setting up AWS CloudFront..."
    
    # Install AWS CLI if not present
    if ! command -v aws &> /dev/null; then
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        ./aws/install
        rm -rf aws awscliv2.zip
    fi
    
    # Create CloudFront distribution configuration
    cat > /opt/not-a-label/cloudfront-config.json << EOF
{
  "CallerReference": "not-a-label-$(date +%s)",
  "Comment": "Not a Label CDN Distribution",
  "DefaultCacheBehavior": {
    "TargetOriginId": "not-a-label-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "Compress": true
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "not-a-label-origin",
        "DomainName": "${DOMAIN}",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only"
        }
      }
    ]
  },
  "Enabled": true
}
EOF
}

# 5. Database optimization
log "Optimizing database performance..."
cat > /etc/postgresql/*/main/conf.d/performance.conf << EOF
# Performance optimizations
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_parallel_maintenance_workers = 4
EOF

# 6. Redis optimization
log "Optimizing Redis configuration..."
cat >> /etc/redis/redis.conf << EOF

# Performance optimizations
tcp-keepalive 300
tcp-backlog 511
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
rdbcompression yes
rdbchecksum yes
EOF

# 7. System-level optimizations
log "Applying system-level optimizations..."
cat > /etc/sysctl.d/99-not-a-label.conf << EOF
# Network optimizations
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728
net.ipv4.tcp_congestion_control = bbr
net.core.default_qdisc = fq

# File system optimizations
fs.file-max = 2097152
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# Security optimizations
net.ipv4.tcp_syncookies = 1
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
EOF

# Apply sysctl settings
sysctl -p /etc/sysctl.d/99-not-a-label.conf

# 8. Setup monitoring and alerting
log "Setting up monitoring..."
cat > /opt/not-a-label/scripts/performance-monitor.sh << 'EOF'
#!/bin/bash

# Performance monitoring script
LOG_FILE="/var/log/not-a-label/performance.log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=90

# Get system metrics
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | cut -d'%' -f1)

# Log metrics
echo "[$(date)] CPU: ${CPU_USAGE}%, Memory: ${MEMORY_USAGE}%, Disk: ${DISK_USAGE}%" >> "$LOG_FILE"

# Check thresholds and alert
if (( $(echo "$CPU_USAGE > $ALERT_THRESHOLD_CPU" | bc -l) )); then
    echo "ALERT: High CPU usage: ${CPU_USAGE}%" | logger -t not-a-label-monitor
fi

if (( $(echo "$MEMORY_USAGE > $ALERT_THRESHOLD_MEMORY" | bc -l) )); then
    echo "ALERT: High memory usage: ${MEMORY_USAGE}%" | logger -t not-a-label-monitor
fi

if [ "$DISK_USAGE" -gt "$ALERT_THRESHOLD_DISK" ]; then
    echo "ALERT: High disk usage: ${DISK_USAGE}%" | logger -t not-a-label-monitor
fi
EOF

chmod +x /opt/not-a-label/scripts/performance-monitor.sh

# 9. Create image optimization script
log "Setting up image optimization..."
cat > /opt/not-a-label/scripts/optimize-images.sh << 'EOF'
#!/bin/bash

# Image optimization script
UPLOAD_DIR="/opt/not-a-label/uploads"
OPTIMIZED_DIR="/opt/not-a-label/uploads/optimized"

# Install optimization tools
apt install -y jpegoptim optipng pngquant webp

# Create optimized directory
mkdir -p "$OPTIMIZED_DIR"

# Function to optimize images
optimize_image() {
    local file="$1"
    local filename=$(basename "$file")
    local extension="${filename##*.}"
    local basename="${filename%.*}"
    
    case "$extension" in
        jpg|jpeg)
            jpegoptim --strip-all --max=85 "$file"
            cwebp -q 80 "$file" -o "${OPTIMIZED_DIR}/${basename}.webp"
            ;;
        png)
            optipng -o7 "$file"
            pngquant --force --ext .png "$file"
            cwebp -q 80 "$file" -o "${OPTIMIZED_DIR}/${basename}.webp"
            ;;
    esac
}

# Process existing images
find "$UPLOAD_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read file; do
    optimize_image "$file"
done
EOF

chmod +x /opt/not-a-label/scripts/optimize-images.sh

# 10. Setup automated certificate renewal
log "Setting up automated SSL certificate renewal..."
cat > /etc/cron.d/certbot-renewal << EOF
# Renew SSL certificates twice daily
0 12 * * * root /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
0 0 * * * root /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

# 11. Create performance tuning cron jobs
log "Setting up performance cron jobs..."
cat > /etc/cron.d/not-a-label-performance << EOF
# Performance monitoring every 5 minutes
*/5 * * * * root /opt/not-a-label/scripts/performance-monitor.sh

# Image optimization daily
0 2 * * * root /opt/not-a-label/scripts/optimize-images.sh

# Clear old logs weekly
0 3 * * 0 root find /var/log/not-a-label -name "*.log" -mtime +7 -delete

# Restart services weekly for memory cleanup
0 4 * * 0 root systemctl restart nginx redis postgresql
EOF

# 12. Restart services
log "Restarting services..."
systemctl restart nginx
systemctl restart postgresql
systemctl restart redis
systemctl restart pm2-root

# 13. Run initial optimizations
log "Running initial optimizations..."
/opt/not-a-label/scripts/optimize-images.sh &
nginx -s reload

# 14. Verify setup
log "Verifying optimization setup..."
nginx -t || error "Nginx configuration test failed"
systemctl is-active nginx || error "Nginx is not running"
systemctl is-active postgresql || error "PostgreSQL is not running"
systemctl is-active redis || error "Redis is not running"

success "Production optimization completed successfully!"

echo ""
echo "=================================="
echo "Optimization Summary:"
echo "- Nginx performance tuning: ✓"
echo "- Static asset caching: ✓"
echo "- Database optimization: ✓"
echo "- Redis optimization: ✓"
echo "- System-level tuning: ✓"
echo "- CDN configuration: ✓"
echo "- Monitoring setup: ✓"
echo "- Image optimization: ✓"
echo "- SSL auto-renewal: ✓"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Configure your CDN provider settings"
echo "2. Monitor performance metrics"
echo "3. Run load tests to validate improvements"
echo "4. Set up alerting for critical metrics"
echo "=================================="