#!/bin/bash

# Production Monitoring Script for Not a Label
# This script performs comprehensive health checks on the production environment

echo "🔍 Not a Label Production Monitor"
echo "================================="
echo "Timestamp: $(date)"
echo ""

# Server details
SERVER_IP="147.182.252.146"
DOMAIN="not-a-label.art"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service
check_service() {
    local service=$1
    local check_command=$2
    local result
    
    printf "Checking $service... "
    
    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

echo "1. DNS Resolution"
echo "-----------------"
check_service "DNS A record" "dig +short $DOMAIN | grep -q $SERVER_IP"
check_service "DNS www record" "dig +short www.$DOMAIN | grep -q $SERVER_IP"

echo ""
echo "2. Network Connectivity"
echo "-----------------------"
check_service "Ping server" "ping -c 1 -W 2 $SERVER_IP"
check_service "HTTP port 80" "nc -zv -w 2 $SERVER_IP 80"
check_service "HTTPS port 443" "nc -zv -w 2 $SERVER_IP 443"

echo ""
echo "3. Web Services"
echo "---------------"
check_service "HTTP redirect" "curl -s -o /dev/null -w '%{http_code}' -L http://$DOMAIN | grep -q '200'"
check_service "HTTPS access" "curl -s -o /dev/null -w '%{http_code}' -L https://$DOMAIN | grep -q '200'"
check_service "SSL certificate" "echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates"

echo ""
echo "4. Application Health"
echo "--------------------"
# Check if homepage loads
if curl -s -L https://$DOMAIN | grep -q "Not a Label"; then
    echo -e "Homepage content: ${GREEN}✓ OK${NC}"
else
    echo -e "Homepage content: ${RED}✗ FAILED${NC}"
fi

# Check API endpoint
if curl -s -L https://$DOMAIN/api/health | grep -q "ok"; then
    echo -e "API health check: ${GREEN}✓ OK${NC}"
else
    echo -e "API health check: ${YELLOW}⚠ Not available${NC}"
fi

echo ""
echo "5. Performance Metrics"
echo "---------------------"
# Measure response time
response_time=$(curl -s -o /dev/null -w '%{time_total}' -L https://$DOMAIN)
echo "Homepage load time: ${response_time}s"

# Check response headers
echo ""
echo "Response headers:"
curl -sI -L https://$DOMAIN | grep -E "(Server|X-Powered-By|Content-Type)"

echo ""
echo "================================="
echo "Monitor completed at $(date)"

# Summary
echo ""
echo "Summary:"
echo "--------"
if check_service "Overall site availability" "curl -s -o /dev/null -w '%{http_code}' -L https://$DOMAIN | grep -q '200'"; then
    echo -e "${GREEN}✓ Site is UP and running${NC}"
    exit 0
else
    echo -e "${RED}✗ Site appears to be DOWN${NC}"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. SSH into server: ssh root@$SERVER_IP"
    echo "2. Check PM2 status: pm2 status"
    echo "3. Check Nginx: sudo systemctl status nginx"
    echo "4. Check logs: pm2 logs not-a-label"
    exit 1
fi