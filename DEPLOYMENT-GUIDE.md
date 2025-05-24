# Not a Label V2 - Deployment Guide

This guide will help you deploy the Not a Label V2 platform to your production server.

## Prerequisites

- DigitalOcean server with Ubuntu 20.04+ 
- Docker and Docker Compose installed
- Domain pointing to your server (not-a-label.art)
- SSH access to the server

## Step 1: Push to GitHub

First, push the code to your GitHub repository:

```bash
./push-to-github.sh
```

When prompted, enter your GitHub repository URL.

## Step 2: Prepare Production Environment

1. SSH into your server:
```bash
ssh root@146.190.205.102
```

2. Create the project directory:
```bash
mkdir -p /root/not-a-label-v2
cd /root/not-a-label-v2
```

3. Create production environment file:
```bash
nano .env.production.server
```

Add your production credentials (see `.env.production` for template):
```env
# Database
POSTGRES_PASSWORD=your-secure-password-here
DATABASE_URL=postgresql://notalabel:your-secure-password-here@postgres:5432/notalabel

# JWT & Auth
JWT_SECRET=your-very-secure-jwt-secret-here
NEXTAUTH_SECRET=your-very-secure-nextauth-secret-here
NEXTAUTH_URL=https://www.not-a-label.art

# API Configuration
API_URL=https://api.not-a-label.art

# Add all other required environment variables...
```

4. Save and exit (Ctrl+X, Y, Enter)

## Step 3: Deploy from Local Machine

Run the deployment script from your local machine:

```bash
./deploy-to-server.sh
```

This script will:
- Upload the code to your server
- Install dependencies
- Build the application
- Run database migrations
- Start Docker containers
- Set up SSL certificates (if needed)

## Step 4: Verify Deployment

1. Check if services are running:
```bash
ssh root@146.190.205.102 'cd /root/not-a-label-v2/current && docker-compose ps'
```

2. Visit your website:
- Main site: https://www.not-a-label.art
- API health: https://api.not-a-label.art/health

## Step 5: Set Up Automatic Deployment (Optional)

### GitHub Actions Setup

1. Go to your GitHub repository settings
2. Navigate to Secrets and variables → Actions
3. Add these secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password
   - `SSH_PRIVATE_KEY`: Your server's SSH private key
   - `SERVER_IP`: 146.190.205.102

4. Push to main branch to trigger automatic deployment

## Monitoring & Maintenance

### View Logs
```bash
# All services
ssh root@146.190.205.102 'cd /root/not-a-label-v2/current && docker-compose logs -f'

# Specific service
ssh root@146.190.205.102 'cd /root/not-a-label-v2/current && docker-compose logs -f web'
```

### Restart Services
```bash
ssh root@146.190.205.102 'cd /root/not-a-label-v2/current && docker-compose restart'
```

### Update SSL Certificates
SSL certificates auto-renew via cron. To manually renew:
```bash
ssh root@146.190.205.102 'certbot renew'
```

## Troubleshooting

### Services not starting
1. Check logs: `docker-compose logs [service-name]`
2. Verify environment variables: `docker-compose config`
3. Check disk space: `df -h`

### Database connection issues
1. Verify PostgreSQL is running: `docker-compose ps postgres`
2. Check connection string in .env
3. Run migrations manually: `docker-compose run user-service npx prisma migrate deploy`

### SSL/HTTPS issues
1. Check certificate status: `certbot certificates`
2. Verify nginx config: `docker-compose exec nginx nginx -t`
3. Check DNS records point to correct IP

## Backup Procedures

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U notalabel notalabel > backup-$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T postgres psql -U notalabel notalabel < backup-20240101.sql
```

### Full Application Backup
```bash
tar -czf not-a-label-backup-$(date +%Y%m%d).tar.gz \
  /root/not-a-label-v2/current \
  --exclude=node_modules \
  --exclude=.next
```

## Support

For issues or questions:
1. Check logs first
2. Review this guide
3. Check GitHub issues
4. Contact support@not-a-label.art