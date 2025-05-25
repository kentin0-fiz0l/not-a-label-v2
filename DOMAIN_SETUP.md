# Domain Setup for not-a-label.art

This guide documents the domain configuration for the Not a Label platform.

## Current Status

The domain `not-a-label.art` is configured and live with:
- SSL/TLS certificate installed via Let's Encrypt
- Nginx configured as reverse proxy
- Application running on PM2
- Environment variables updated for HTTPS URLs

## DNS Configuration

Ensure your DNS records point to the DigitalOcean server:
- A record: `@` → `147.182.252.146`
- A record: `www` → `147.182.252.146`

## GitHub Deployment Setup

To enable automated deployment from GitHub:

### 1. Generate SSH Key for GitHub Actions

On your local machine:
```bash
ssh-keygen -t ed25519 -C "github-actions@not-a-label.art" -f ~/.ssh/github-actions
```

### 2. Add Public Key to Server

Copy the public key to the server's authorized_keys:
```bash
cat ~/.ssh/github-actions.pub | ssh root@147.182.252.146 "cat >> ~/.ssh/authorized_keys"
```

### 3. Configure GitHub Secrets

In your GitHub repository settings (Settings → Secrets and variables → Actions), add:
- `HOST`: `147.182.252.146`
- `USERNAME`: `root`
- `SSH_KEY`: Contents of `~/.ssh/github-actions` (private key)

### 4. Push to GitHub

```bash
# Add all new files
git add .

# Commit changes
git commit -m "Add production deployment configuration"

# Push to GitHub
git push origin main
```

## Manual Deployment

If you need to deploy manually:

```bash
# SSH into the server
ssh root@147.182.252.146

# Navigate to application
cd /opt/not-a-label

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Restart PM2
pm2 restart not-a-label
pm2 save
```

## SSL Certificate Renewal

The SSL certificate auto-renews via Certbot. To manually renew:
```bash
sudo certbot renew --dry-run  # Test renewal
sudo certbot renew             # Actual renewal
```

## Monitoring

Check application status:
```bash
# PM2 status
pm2 status

# View logs
pm2 logs not-a-label

# Nginx status
sudo systemctl status nginx

# Check SSL certificate
sudo certbot certificates
```

## Troubleshooting

### Application Not Accessible
1. Check PM2: `pm2 status`
2. Check Nginx: `sudo nginx -t && sudo systemctl status nginx`
3. Check firewall: `sudo ufw status`

### SSL Issues
1. Check certificate: `sudo certbot certificates`
2. Test configuration: `sudo nginx -t`
3. Check Nginx SSL config in `/etc/nginx/sites-available/not-a-label`

### Database Connection Issues
1. Check PostgreSQL: `sudo systemctl status postgresql`
2. Test connection: `psql -U notalabel -d notalabel -h localhost`
3. Check `.env.production` for correct DATABASE_URL