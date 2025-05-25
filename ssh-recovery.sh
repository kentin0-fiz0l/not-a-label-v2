#!/bin/bash

# SSH Recovery Script for DigitalOcean Droplet
# This script helps diagnose and fix SSH connection issues

set -e

DROPLET_IP="146.190.205.102"
DROPLET_USER="root"

echo "🔧 SSH Recovery Tool for Not a Label Droplet"
echo "============================================"
echo ""

# Function to test basic connectivity
test_connectivity() {
    echo "1. Testing basic network connectivity..."
    
    if ping -c 3 $DROPLET_IP > /dev/null 2>&1; then
        echo "   ✅ Droplet is responding to ping"
    else
        echo "   ❌ Droplet is not responding to ping"
        echo "   This could mean:"
        echo "   - The droplet is powered off"
        echo "   - Firewall is blocking ICMP"
        echo "   - Network connectivity issue"
    fi
    echo ""
}

# Function to test SSH port
test_ssh_port() {
    echo "2. Testing SSH port (22)..."
    
    if nc -zv -w 5 $DROPLET_IP 22 2>&1 | grep -q "succeeded"; then
        echo "   ✅ SSH port is open"
    else
        echo "   ❌ SSH port is not accessible"
        echo "   This could mean:"
        echo "   - SSH service is not running"
        echo "   - Firewall is blocking port 22"
        echo "   - SSH is configured on a different port"
    fi
    echo ""
}

# Function to test SSH connection
test_ssh_connection() {
    echo "3. Testing SSH connection..."
    
    ssh -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=no $DROPLET_USER@$DROPLET_IP exit 2>&1 | {
        while IFS= read -r line; do
            if [[ $line == *"Permission denied"* ]]; then
                echo "   ❌ SSH key authentication failed"
                echo "   Try: ssh-add ~/.ssh/id_rsa"
            elif [[ $line == *"Connection refused"* ]]; then
                echo "   ❌ SSH connection refused"
            elif [[ $line == *"Connection timed out"* ]]; then
                echo "   ❌ SSH connection timed out"
            fi
        done
    }
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        echo "   ✅ SSH connection successful!"
    fi
    echo ""
}

# Function to provide recovery options
provide_recovery_options() {
    echo "🔧 Recovery Options:"
    echo "==================="
    echo ""
    echo "1. Access via DigitalOcean Console:"
    echo "   - Log into https://cloud.digitalocean.com"
    echo "   - Navigate to your droplet"
    echo "   - Click 'Access' → 'Launch Droplet Console'"
    echo ""
    echo "2. Power cycle the droplet:"
    echo "   - In DigitalOcean dashboard"
    echo "   - Click 'Power' → 'Power Cycle'"
    echo ""
    echo "3. Reset root password:"
    echo "   - In DigitalOcean dashboard"
    echo "   - Click 'Access' → 'Reset Root Password'"
    echo ""
    echo "4. Check droplet firewall:"
    echo "   In the console, run:"
    echo "   sudo ufw status"
    echo "   sudo ufw allow 22/tcp"
    echo "   sudo systemctl restart ssh"
    echo ""
    echo "5. Recovery commands to run in console:"
    cat << 'EOF'
# Check SSH service
systemctl status ssh
systemctl restart ssh

# Check firewall
ufw status
ufw allow 22/tcp

# Check fail2ban (if installed)
fail2ban-client status
fail2ban-client status sshd

# View SSH logs
journalctl -u ssh -n 50

# Check disk space
df -h

# Check system load
top -n 1

# Restart networking
systemctl restart networking

# View auth logs
tail -n 50 /var/log/auth.log
EOF
}

# Function to generate console deployment script
generate_console_script() {
    echo ""
    echo "📝 Deployment script for DigitalOcean Console:"
    echo "=============================================="
    echo ""
    cat << 'EOF'
#!/bin/bash
# Run this in the DigitalOcean Console

# Fix SSH if needed
systemctl restart ssh
ufw allow 22/tcp

# Navigate to app directory
cd /opt/not-a-label

# Pull latest changes
git fetch origin main
git reset --hard origin/main

# Install dependencies
npm install

# Build application
npm run build

# Restart services
docker-compose down
docker-compose up -d

# Alternative: PM2
pm2 restart all

# Check status
docker-compose ps
pm2 status
EOF
}

# Main execution
echo "Starting SSH recovery diagnostics..."
echo ""

test_connectivity
test_ssh_port
test_ssh_connection
provide_recovery_options
generate_console_script

echo ""
echo "📌 Additional Resources:"
echo "   - DigitalOcean Support: https://www.digitalocean.com/support"
echo "   - Status Page: https://status.digitalocean.com"
echo "   - Community: https://www.digitalocean.com/community"