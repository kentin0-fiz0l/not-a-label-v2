#!/bin/bash

# Not a Label - Health Check Script
# Monitors the platform health and sends alerts

set -e

echo "🏥 Not a Label - Health Check"
echo "============================="
echo "$(date)"
echo ""

# Configuration
WEBSITE_URL="https://www.not-a-label.art"
API_URL="https://api.not-a-label.art"
EXPECTED_HTTP_CODE=200
TIMEOUT=10

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Health check function
check_service() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "Checking $name... "
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$url" 2>/dev/null)
        
        if [ "$response" = "$expected_code" ]; then
            echo -e "${GREEN}✅ OK${NC} (HTTP $response)"
            return 0
        else
            echo -e "${RED}❌ FAILED${NC} (HTTP $response)"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️ SKIPPED${NC} (curl not available)"
        return 2
    fi
}

# Check system resources
check_system() {
    echo "📊 System Resources:"
    echo "==================="
    
    # Check disk space
    disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        echo -e "💾 Disk Usage: ${RED}$disk_usage%${NC} (WARNING: Low space)"
    elif [ "$disk_usage" -gt 80 ]; then
        echo -e "💾 Disk Usage: ${YELLOW}$disk_usage%${NC}"
    else
        echo -e "💾 Disk Usage: ${GREEN}$disk_usage%${NC}"
    fi
    
    # Check memory
    if command -v free &> /dev/null; then
        memory_usage=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
        if [ "$memory_usage" -gt 90 ]; then
            echo -e "🧠 Memory Usage: ${RED}$memory_usage%${NC} (WARNING: High usage)"
        elif [ "$memory_usage" -gt 80 ]; then
            echo -e "🧠 Memory Usage: ${YELLOW}$memory_usage%${NC}"
        else
            echo -e "🧠 Memory Usage: ${GREEN}$memory_usage%${NC}"
        fi
    fi
    
    # Check load average
    if command -v uptime &> /dev/null; then
        load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
        echo "⚡ Load Average: $load_avg"
    fi
    
    echo ""
}

# Check PM2 processes
check_pm2() {
    echo "📋 PM2 Processes:"
    echo "=================="
    
    if command -v pm2 &> /dev/null; then
        if pm2 list | grep -q "not-a-label"; then
            status=$(pm2 list | grep "not-a-label" | awk '{print $10}')
            if [ "$status" = "online" ]; then
                echo -e "🚀 Not a Label App: ${GREEN}✅ RUNNING${NC}"
            else
                echo -e "🚀 Not a Label App: ${RED}❌ STOPPED${NC}"
            fi
        else
            echo -e "🚀 Not a Label App: ${RED}❌ NOT FOUND${NC}"
        fi
    else
        echo -e "⚠️ PM2 not available"
    fi
    
    echo ""
}

# Check SSL certificate
check_ssl() {
    echo "🔒 SSL Certificate:"
    echo "==================="
    
    if command -v openssl &> /dev/null; then
        expiry_date=$(echo | openssl s_client -servername www.not-a-label.art -connect www.not-a-label.art:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
        expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null || echo "0")
        current_timestamp=$(date +%s)
        days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        if [ "$days_until_expiry" -gt 30 ]; then
            echo -e "📜 SSL Expires: ${GREEN}$days_until_expiry days${NC} ($expiry_date)"
        elif [ "$days_until_expiry" -gt 7 ]; then
            echo -e "📜 SSL Expires: ${YELLOW}$days_until_expiry days${NC} ($expiry_date)"
        else
            echo -e "📜 SSL Expires: ${RED}$days_until_expiry days${NC} (WARNING: Renewal needed)"
        fi
    else
        echo "⚠️ OpenSSL not available"
    fi
    
    echo ""
}

# Main health checks
echo "🌐 Service Health:"
echo "=================="

check_service "Website" "$WEBSITE_URL"
website_status=$?

check_service "API Gateway" "$API_URL/health" 200
api_status=$?

echo ""

# System checks
check_system
check_pm2
check_ssl

# Summary
echo "📋 Health Check Summary:"
echo "========================"

total_checks=2
failed_checks=0

if [ $website_status -ne 0 ]; then
    failed_checks=$((failed_checks + 1))
fi

if [ $api_status -ne 0 ]; then
    failed_checks=$((failed_checks + 1))
fi

if [ $failed_checks -eq 0 ]; then
    echo -e "${GREEN}✅ All services healthy!${NC}"
    exit 0
elif [ $failed_checks -lt $total_checks ]; then
    echo -e "${YELLOW}⚠️ Some services need attention ($failed_checks/$total_checks failed)${NC}"
    exit 1
else
    echo -e "${RED}❌ Critical: Multiple services down ($failed_checks/$total_checks failed)${NC}"
    exit 2
fi