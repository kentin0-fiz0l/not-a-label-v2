#!/bin/bash

# Logging and Monitoring Setup for Not a Label
# Sets up comprehensive logging, monitoring, and alerting

set -e

# Configuration
APP_DIR="/opt/not-a-label"
LOG_DIR="/var/log/not-a-label"
DOMAIN="not-a-label.art"

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

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

log "Setting up logging and monitoring..."

# Create log directories
mkdir -p "$LOG_DIR"/{app,nginx,system,monitoring}

# 1. Configure PM2 logging
log "Configuring PM2 logging..."
cat > "$APP_DIR/ecosystem.config.js" << 'EOF'
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
    error_file: '/var/log/not-a-label/app/error.log',
    out_file: '/var/log/not-a-label/app/out.log',
    log_file: '/var/log/not-a-label/app/combined.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git', 'uploads'],
    autorestart: true,
    restart_delay: 5000,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# 2. Configure log rotation
log "Setting up log rotation..."
cat > /etc/logrotate.d/not-a-label << EOF
/var/log/not-a-label/*/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}

/var/log/nginx/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 \`cat /var/run/nginx.pid\`
    endscript
}
EOF

# 3. Create monitoring scripts
log "Creating monitoring scripts..."

# Real-time monitoring dashboard
cat > "$APP_DIR/scripts/monitor-dashboard.sh" << 'EOF'
#!/bin/bash

# Real-time monitoring dashboard
while true; do
    clear
    echo "=== Not a Label Monitoring Dashboard ==="
    echo "Time: $(date)"
    echo ""
    
    # System resources
    echo "SYSTEM RESOURCES:"
    echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%"
    echo "Memory: $(free -h | awk '/^Mem:/ {print $3 " / " $2}')"
    echo "Disk: $(df -h / | awk 'NR==2 {print $3 " / " $2 " (" $5 ")"}')"
    echo ""
    
    # Process status
    echo "SERVICES:"
    pm2 list --no-color | grep -E "(not-a-label|status)" || echo "PM2: Not running"
    systemctl is-active nginx >/dev/null && echo "Nginx: Active" || echo "Nginx: Inactive"
    systemctl is-active postgresql >/dev/null && echo "PostgreSQL: Active" || echo "PostgreSQL: Inactive"
    systemctl is-active redis >/dev/null && echo "Redis: Active" || echo "Redis: Inactive"
    echo ""
    
    # Recent errors
    echo "RECENT ERRORS (last 5):"
    tail -n 5 /var/log/not-a-label/app/error.log 2>/dev/null | grep -E "(ERROR|WARN)" || echo "No recent errors"
    echo ""
    
    # Request stats (last minute)
    echo "REQUEST STATS (last minute):"
    awk -v d1="$(date --date='-1 min' '+%d/%b/%Y:%H:%M')" '$4 > "["d1' /var/log/nginx/access.log 2>/dev/null | wc -l | xargs echo "Total requests:"
    echo ""
    
    # Active connections
    echo "ACTIVE CONNECTIONS:"
    ss -tn state established '( dport = :443 or dport = :80 )' | wc -l | xargs echo "HTTP/HTTPS:"
    echo ""
    
    echo "Press Ctrl+C to exit"
    sleep 5
done
EOF
chmod +x "$APP_DIR/scripts/monitor-dashboard.sh"

# Health check monitor
cat > "$APP_DIR/scripts/health-monitor.sh" << 'EOF'
#!/bin/bash

# Health monitoring with alerts
DOMAIN="not-a-label.art"
ALERT_EMAIL="admin@not-a-label.art"
LOG_FILE="/var/log/not-a-label/monitoring/health-check.log"

check_health() {
    local service=$1
    local check_command=$2
    local status="OK"
    
    if ! eval "$check_command" > /dev/null 2>&1; then
        status="FAILED"
        echo "[$(date)] $service check failed" >> "$LOG_FILE"
        # Send alert (requires mail setup)
        # echo "$service is down on $DOMAIN" | mail -s "Alert: $service Down" "$ALERT_EMAIL"
    fi
    
    echo "$service: $status"
}

# Run health checks
echo "=== Health Check Report ===" | tee -a "$LOG_FILE"
echo "Time: $(date)" | tee -a "$LOG_FILE"

check_health "Web Server" "curl -sf https://$DOMAIN -o /dev/null"
check_health "API Endpoint" "curl -sf https://$DOMAIN/api/health -o /dev/null"
check_health "Database" "pg_isready -U notalabel"
check_health "Redis" "redis-cli ping"
check_health "Disk Space" "[ $(df / | awk 'NR==2 {print int($5)}') -lt 90 ]"

echo "=========================" | tee -a "$LOG_FILE"
EOF
chmod +x "$APP_DIR/scripts/health-monitor.sh"

# Performance monitor
cat > "$APP_DIR/scripts/performance-monitor.sh" << 'EOF'
#!/bin/bash

# Performance monitoring script
LOG_DIR="/var/log/not-a-label/monitoring"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Collect metrics
{
    echo "=== Performance Report ==="
    echo "Timestamp: $(date)"
    echo ""
    
    # Response times
    echo "Response Times (last 100 requests):"
    tail -n 100 /var/log/nginx/access.log | \
        awk '{print $NF}' | \
        awk '{sum+=$1; count++} END {if(count>0) print "Average: " sum/count "ms"}'
    
    # Memory usage
    echo ""
    echo "Memory Usage:"
    pm2 info not-a-label | grep -E "(memory|heap)" || echo "PM2 not running"
    
    # Database performance
    echo ""
    echo "Database Stats:"
    sudo -u postgres psql -d notalabel -c "SELECT count(*) as connections FROM pg_stat_activity;" 2>/dev/null
    
    # Top processes
    echo ""
    echo "Top Processes by CPU:"
    ps aux --sort=-%cpu | head -n 6
    
} > "$LOG_DIR/performance_${TIMESTAMP}.log"

# Keep only last 7 days of performance logs
find "$LOG_DIR" -name "performance_*.log" -mtime +7 -delete
EOF
chmod +x "$APP_DIR/scripts/performance-monitor.sh"

# 4. Setup cron jobs for monitoring
log "Setting up monitoring cron jobs..."
cat > /etc/cron.d/not-a-label-monitoring << EOF
# Health checks every 5 minutes
*/5 * * * * root /opt/not-a-label/scripts/health-monitor.sh

# Performance monitoring every hour
0 * * * * root /opt/not-a-label/scripts/performance-monitor.sh

# Log analysis daily
0 2 * * * root /opt/not-a-label/scripts/analyze-logs.sh
EOF

# 5. Create log analysis script
cat > "$APP_DIR/scripts/analyze-logs.sh" << 'EOF'
#!/bin/bash

# Log analysis script
REPORT_DIR="/var/log/not-a-label/monitoring"
TODAY=$(date +%Y%m%d)

{
    echo "=== Daily Log Analysis Report ==="
    echo "Date: $(date)"
    echo ""
    
    # Error summary
    echo "ERROR SUMMARY:"
    echo "--------------"
    grep -E "(ERROR|CRITICAL)" /var/log/not-a-label/app/*.log | \
        awk '{print $5}' | sort | uniq -c | sort -rn | head -10
    
    # Request statistics
    echo ""
    echo "REQUEST STATISTICS:"
    echo "------------------"
    echo "Total requests: $(wc -l < /var/log/nginx/access.log)"
    echo "Unique IPs: $(awk '{print $1}' /var/log/nginx/access.log | sort -u | wc -l)"
    echo "404 errors: $(grep " 404 " /var/log/nginx/access.log | wc -l)"
    echo "500 errors: $(grep " 500 " /var/log/nginx/access.log | wc -l)"
    
    # Top endpoints
    echo ""
    echo "TOP ENDPOINTS:"
    echo "--------------"
    awk '{print $7}' /var/log/nginx/access.log | \
        grep -v "^/static" | sort | uniq -c | sort -rn | head -10
    
    # User agents
    echo ""
    echo "TOP USER AGENTS:"
    echo "----------------"
    awk -F'"' '{print $6}' /var/log/nginx/access.log | \
        sort | uniq -c | sort -rn | head -5
    
    # Slow queries (if any)
    echo ""
    echo "SLOW REQUESTS (>1000ms):"
    echo "-----------------------"
    awk '$NF > 1000 {print $7, $NF"ms"}' /var/log/nginx/access.log | \
        sort -k2 -rn | head -10
    
} > "$REPORT_DIR/daily_report_${TODAY}.log"

# Email report (requires mail setup)
# cat "$REPORT_DIR/daily_report_${TODAY}.log" | mail -s "Daily Log Report - $TODAY" admin@not-a-label.art
EOF
chmod +x "$APP_DIR/scripts/analyze-logs.sh"

# 6. Create alert script
cat > "$APP_DIR/scripts/send-alert.sh" << 'EOF'
#!/bin/bash

# Alert sending script
ALERT_TYPE=$1
MESSAGE=$2
WEBHOOK_URL=${SLACK_WEBHOOK_URL:-""}

# Log alert
echo "[$(date)] ALERT: $ALERT_TYPE - $MESSAGE" >> /var/log/not-a-label/monitoring/alerts.log

# Send to Slack (if configured)
if [ -n "$WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚨 *$ALERT_TYPE*: $MESSAGE\"}" \
        "$WEBHOOK_URL"
fi

# Send email (if mail is configured)
# echo "$MESSAGE" | mail -s "Alert: $ALERT_TYPE" admin@not-a-label.art
EOF
chmod +x "$APP_DIR/scripts/send-alert.sh"

# 7. Install monitoring dependencies
log "Installing monitoring tools..."
apt-get install -y htop iotop nethogs sysstat

# 8. Configure sysstat
sed -i 's/ENABLED="false"/ENABLED="true"/' /etc/default/sysstat
systemctl enable sysstat
systemctl start sysstat

success "Logging and monitoring setup completed!"

echo ""
echo "=== Monitoring Tools Available ==="
echo "Real-time dashboard: $APP_DIR/scripts/monitor-dashboard.sh"
echo "Health check: $APP_DIR/scripts/health-monitor.sh"
echo "Performance check: $APP_DIR/scripts/performance-monitor.sh"
echo "Log analysis: $APP_DIR/scripts/analyze-logs.sh"
echo ""
echo "Logs location: $LOG_DIR"
echo "Monitoring reports: $LOG_DIR/monitoring/"
echo ""
echo "System tools: htop, iotop, nethogs, sar"
echo "==================================="