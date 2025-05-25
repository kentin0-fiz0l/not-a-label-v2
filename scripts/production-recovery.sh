#!/bin/bash

# Production Recovery Script for Not a Label
# This script helps recover the production site when it's down

echo "🚑 Not a Label Production Recovery"
echo "=================================="
echo "Timestamp: $(date)"
echo ""

# Instructions for manual recovery
cat << 'EOF'
To recover the production site, follow these steps:

1. SSH into the server:
   ssh root@147.182.252.146

2. Check and restart services:
   
   # Check PM2 status
   pm2 status
   
   # If app is not running, start it
   cd /opt/not-a-label
   pm2 start ecosystem.config.js
   pm2 save
   
   # Check Nginx
   sudo systemctl status nginx
   sudo nginx -t
   sudo systemctl restart nginx
   
   # Check PostgreSQL
   sudo systemctl status postgresql
   sudo systemctl restart postgresql
   
   # Check Redis
   sudo systemctl status redis
   sudo systemctl restart redis

3. Check SSL certificate:
   
   # Test SSL renewal
   sudo certbot renew --dry-run
   
   # Force renewal if needed
   sudo certbot renew --force-renewal
   
   # Restart Nginx after renewal
   sudo systemctl restart nginx

4. Check application logs:
   
   # PM2 logs
   pm2 logs not-a-label --lines 100
   
   # Nginx error logs
   sudo tail -n 100 /var/log/nginx/error.log
   
   # System logs
   sudo journalctl -xe

5. Rebuild application if needed:
   
   cd /opt/not-a-label
   git pull origin main
   npm install
   npm run build
   pm2 restart not-a-label
   pm2 save

6. Check firewall rules:
   
   sudo ufw status
   sudo ufw allow 443/tcp
   sudo ufw allow 80/tcp
   sudo ufw reload

7. Verify DNS and domain:
   
   # Check DNS resolution
   dig not-a-label.art
   
   # Check certificate
   sudo certbot certificates

After completing these steps, run the monitoring script to verify:
./scripts/production-monitor.sh
EOF

echo ""
echo "=================================="
echo "To add the GitHub Actions SSH key to the server:"
echo ""
echo "1. Copy this key:"
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEtx7egTTfUwnj+WYVDw59EW3EUK0B7FpsxiaDfzc4FS github-actions@not-a-label.art"
echo ""
echo "2. SSH into server and run:"
echo "echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEtx7egTTfUwnj+WYVDw59EW3EUK0B7FpsxiaDfzc4FS github-actions@not-a-label.art' >> ~/.ssh/authorized_keys"