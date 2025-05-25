# DigitalOcean Deployment Guide

This guide provides step-by-step instructions for deploying Not a Label to a DigitalOcean droplet.

## Prerequisites

1. **DigitalOcean Account** with a droplet created
2. **Domain Names** pointed to your droplet:
   - `not-a-label.art` → Droplet IP
   - `www.not-a-label.art` → Droplet IP
   - `api.not-a-label.art` → Droplet IP
3. **SSH Access** to your droplet
4. **Environment Variables** configured

## Initial Droplet Setup

### 1. Create a Droplet

Create a droplet with the following specifications:
- **Image**: Ubuntu 22.04 LTS
- **Plan**: Minimum 2GB RAM, 2 vCPUs
- **Datacenter**: Choose nearest to your users
- **Authentication**: SSH keys (recommended)
- **Firewall**: Enable and configure rules

### 2. Configure Firewall

Add these firewall rules in DigitalOcean:
```
- SSH (22) - Your IP only
- HTTP (80) - All IPv4, All IPv6
- HTTPS (443) - All IPv4, All IPv6
```

### 3. Initial Server Setup

SSH into your droplet and run:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Install additional tools
apt install -y git nginx certbot python3-certbot-nginx

# Create application user
useradd -m -s /bin/bash notalabel
usermod -aG docker notalabel

# Create application directories
mkdir -p /var/www/not-a-label
mkdir -p /var/backups/not-a-label
mkdir -p /var/log/not-a-label
chown -R notalabel:notalabel /var/www/not-a-label
```

## SSL Certificate Setup

### Option 1: Let's Encrypt (Recommended)

```bash
# Stop any services on port 80
systemctl stop nginx

# Obtain certificates
certbot certonly --standalone \
  -d not-a-label.art \
  -d www.not-a-label.art \
  -d api.not-a-label.art \
  --non-interactive \
  --agree-tos \
  -m your-email@example.com

# Create SSL directory
mkdir -p /var/www/not-a-label/infrastructure/nginx/ssl

# Copy certificates
cp /etc/letsencrypt/live/not-a-label.art/fullchain.pem /var/www/not-a-label/infrastructure/nginx/ssl/
cp /etc/letsencrypt/live/not-a-label.art/privkey.pem /var/www/not-a-label/infrastructure/nginx/ssl/
cp /etc/letsencrypt/live/not-a-label.art/chain.pem /var/www/not-a-label/infrastructure/nginx/ssl/

# Set permissions
chmod 644 /var/www/not-a-label/infrastructure/nginx/ssl/*.pem

# Setup auto-renewal
echo "0 0,12 * * * root certbot renew --quiet --post-hook 'docker-compose -f /var/www/not-a-label/docker-compose.yml restart nginx'" > /etc/cron.d/certbot-renewal
```

### Option 2: Custom SSL Certificate

If you have your own SSL certificates:

```bash
# Create SSL directory
mkdir -p /var/www/not-a-label/infrastructure/nginx/ssl

# Copy your certificates
# Place your files as:
# - fullchain.pem (certificate + intermediate certificates)
# - privkey.pem (private key)
# - chain.pem (intermediate certificates only)
```

## Environment Configuration

### 1. Create Environment File

On your droplet:

```bash
cd /var/www/not-a-label
cp .env.example .env
nano .env
```

### 2. Configure Environment Variables

Update the `.env` file with production values:

```env
# Database
POSTGRES_USER=notalabel
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=notalabel

# Redis
REDIS_PASSWORD=<strong-password>

# JWT
JWT_SECRET=<generate-with-openssl-rand-base64-32>

# NextAuth
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://not-a-label.art

# API Keys
OPENAI_API_KEY=<your-openai-key>
ANTHROPIC_API_KEY=<your-anthropic-key>

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
AWS_BUCKET=<your-bucket-name>
AWS_REGION=<your-region>

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## Deployment Process

### 1. Initial Deployment

From your local machine:

```bash
# Set environment variable
export DROPLET_IP=your.droplet.ip.address

# Make scripts executable
chmod +x deploy-digitalocean.sh
chmod +x ssh-recovery.sh
chmod +x health-check.sh

# Run deployment
./deploy-digitalocean.sh
```

### 2. Verify Deployment

The deployment script will:
1. Create a deployment package
2. Upload it to the droplet
3. Extract and set up the application
4. Build Docker images
5. Run database migrations
6. Start all services
7. Run health checks

### 3. Post-Deployment Checks

```bash
# SSH into droplet
ssh root@your.droplet.ip

# Check service status
cd /var/www/not-a-label
docker-compose ps

# View logs
docker-compose logs -f web
docker-compose logs -f api-gateway

# Check nginx logs
docker-compose logs -f nginx
```

## Maintenance

### Updating the Application

```bash
# From local machine
export DROPLET_IP=your.droplet.ip
./deploy-digitalocean.sh
```

### Backup Management

Backups are automatically created:
- Before each deployment
- Daily database backups (kept for 7 days)

Manual backup:
```bash
ssh root@your.droplet.ip
cd /var/www/not-a-label
docker-compose exec postgres pg_dump -U notalabel notalabel | gzip > /var/backups/not-a-label/manual-backup-$(date +%Y%m%d-%H%M%S).sql.gz
```

### Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -m

# Check Docker resource usage
docker stats

# Check application logs
cd /var/www/not-a-label
docker-compose logs --tail=100 -f
```

### Troubleshooting

#### SSH Connection Issues

```bash
# Run recovery script
./ssh-recovery.sh
```

#### Service Issues

```bash
# Restart specific service
docker-compose restart web
docker-compose restart api-gateway

# Restart all services
docker-compose restart

# Full restart
docker-compose down
docker-compose up -d
```

#### Database Issues

```bash
# Connect to database
docker-compose exec postgres psql -U notalabel

# Run migrations manually
docker-compose run --rm user-service npm run migrate
```

## Security Recommendations

1. **Regular Updates**
   ```bash
   apt update && apt upgrade -y
   docker system prune -a
   ```

2. **Firewall Configuration**
   - Use DigitalOcean's firewall
   - Restrict SSH to specific IPs
   - Enable fail2ban for SSH protection

3. **Monitoring**
   - Set up DigitalOcean monitoring
   - Configure alerts for high CPU/memory usage
   - Monitor disk space

4. **Backups**
   - Enable DigitalOcean backups
   - Test restoration procedures
   - Keep offsite backups

## Scaling

When you need to scale:

1. **Vertical Scaling**: Resize your droplet in DigitalOcean panel
2. **Horizontal Scaling**: 
   - Use DigitalOcean Load Balancer
   - Deploy multiple droplets
   - Use managed database

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Run health check: `./health-check.sh`
3. Review nginx logs: `docker-compose logs nginx`
4. Check DigitalOcean monitoring dashboard