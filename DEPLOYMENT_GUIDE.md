# Not a Label - DigitalOcean Deployment Guide

## Current Status

The registration form fix has been committed and pushed to the main repository. The production server (146.190.205.102) is currently inaccessible via SSH.

## Primary Deployment: DigitalOcean

### Method 1: Automated Deployment Script

1. **Run the deployment script**:
   ```bash
   ./deploy-digitalocean.sh
   ```

   This script will:
   - Check SSH connectivity
   - Deploy automatically if SSH works
   - Provide manual instructions if SSH fails

2. **If SSH fails, use the recovery script**:
   ```bash
   ./ssh-recovery.sh
   ```

### Method 2: DigitalOcean Console Deployment

1. **Access the Console**:
   - Log into [DigitalOcean](https://cloud.digitalocean.com)
   - Navigate to your droplet
   - Click "Access" → "Launch Droplet Console"

2. **Run deployment commands**:
   ```bash
   # Navigate to application
   cd /opt/not-a-label

   # Pull latest changes
   git fetch origin main
   git reset --hard origin/main

   # Install dependencies
   npm install

   # Build application
   npm run build

   # Deploy with Docker Compose
   docker-compose down
   docker-compose up -d

   # Alternative: Deploy with PM2
   pm2 restart all
   ```

### Method 3: Docker Compose Deployment

The application includes a complete Docker Compose setup with:
- PostgreSQL database
- Redis cache
- Nginx reverse proxy with SSL
- Automated backups
- Health checks

1. **Copy environment file**:
   ```bash
   cp .env.production.digitalocean .env.production
   # Edit .env.production with your values
   ```

2. **Start services**:
   ```bash
   docker-compose up -d
   ```

3. **Check status**:
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

## Environment Configuration

Copy `.env.production.digitalocean` and configure:

```env
# Database (Local PostgreSQL)
POSTGRES_USER=notalabel
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://notalabel:password@postgres:5432/notalabel

# Redis (Local)
REDIS_PASSWORD=your_redis_password
REDIS_URL=redis://default:password@redis:6379

# Authentication
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
JWT_SECRET=another_secret_here

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## SSL Certificate Setup

1. **Initial certificate**:
   ```bash
   docker-compose run --rm certbot certonly \
     --webroot \
     --webroot-path=/var/www/certbot \
     -d not-a-label.art \
     -d www.not-a-label.art
   ```

2. **Auto-renewal is configured** in docker-compose.yml

## Database Management

1. **Run migrations**:
   ```bash
   docker-compose exec api npx prisma migrate deploy
   ```

2. **Access database**:
   ```bash
   docker-compose exec postgres psql -U notalabel
   ```

3. **Backups** are automated daily, stored in `./backups`

## Monitoring & Logs

```bash
# View all logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f web
docker-compose logs -f api
docker-compose logs -f nginx

# PM2 logs (if using)
pm2 logs
pm2 monit
```

## Troubleshooting

1. **SSH Connection Issues**:
   ```bash
   ./ssh-recovery.sh
   ```

2. **Service Issues**:
   ```bash
   # Restart all services
   docker-compose restart

   # Rebuild and restart
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

3. **Database Issues**:
   ```bash
   # Check database logs
   docker-compose logs postgres

   # Reset database
   docker-compose exec api npx prisma migrate reset
   ```

## Post-Deployment Checklist

- [ ] Verify registration form works (terms checkbox fix)
- [ ] Test user login/logout
- [ ] Check Terms and Privacy pages load
- [ ] Verify API endpoints respond
- [ ] Test file uploads
- [ ] Check SSL certificate
- [ ] Monitor error logs
- [ ] Set up monitoring alerts
- [ ] Configure backups
- [ ] Test email sending

## Quick Reference

```bash
# Deploy
./deploy-digitalocean.sh

# SSH recovery
./ssh-recovery.sh

# Docker commands
docker-compose up -d        # Start all services
docker-compose down         # Stop all services
docker-compose ps          # Check status
docker-compose logs -f     # View logs

# PM2 commands (alternative)
pm2 start ecosystem.config.js
pm2 restart all
pm2 logs
pm2 monit
```

## Support

- **DigitalOcean**: [digitalocean.com/support](https://digitalocean.com/support)
- **Docker**: [docs.docker.com](https://docs.docker.com)
- **Community**: [digitalocean.com/community](https://digitalocean.com/community)