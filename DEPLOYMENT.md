# Not a Label - Deployment Guide

This guide provides instructions for deploying the Not a Label platform to various environments.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Domain name configured (for production)
- SSL certificate (for production)

## Local Development

```bash
# Clone the repository
git clone https://github.com/kentin0-fiz0l/not-a-label-v2.git
cd not-a-label-v2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev

# Access at http://localhost:3000
```

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Select your project
   - Navigate to Settings → Environment Variables
   - Add all required variables from `.env.example`

### Option 2: DigitalOcean Droplet

1. **SSH into your server**
   ```bash
   ssh root@your-server-ip
   ```

2. **Install dependencies**
   ```bash
   # Update system
   apt update && apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   apt install -y nodejs

   # Install PM2
   npm install -g pm2

   # Install Nginx
   apt install -y nginx
   ```

3. **Clone and build the application**
   ```bash
   # Clone repository
   cd /var/www
   git clone https://github.com/kentin0-fiz0l/not-a-label-v2.git
   cd not-a-label-v2

   # Install dependencies
   npm install

   # Build the application
   npm run build

   # Create standalone build (if needed)
   cd apps/web
   npm run build
   cp -r .next/standalone/* /var/www/not-a-label-standalone/
   cp -r .next/static /var/www/not-a-label-standalone/.next/
   cp -r public /var/www/not-a-label-standalone/
   ```

4. **Configure PM2**
   ```bash
   # Start the application
   cd /var/www/not-a-label-standalone
   pm2 start server.js --name "not-a-label"
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```nginx
   # /etc/nginx/sites-available/not-a-label
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

6. **Enable site and restart Nginx**
   ```bash
   ln -s /etc/nginx/sites-available/not-a-label /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

7. **Set up SSL with Certbot**
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

### Option 3: Docker

1. **Build Docker image**
   ```bash
   docker build -t not-a-label .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/notalabel"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# AI Services
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"

# Storage
STORAGE_BUCKET="your-storage-bucket"
STORAGE_REGION="us-east-1"

# Email
EMAIL_FROM="noreply@not-a-label.com"
EMAIL_HOST="smtp.example.com"
EMAIL_PORT="587"
EMAIL_USER="your-email"
EMAIL_PASS="your-password"

# Redis (optional)
REDIS_URL="redis://localhost:6379"
```

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test user registration and login
- [ ] Verify file uploads work correctly
- [ ] Check that emails are being sent
- [ ] Test payment processing (if applicable)
- [ ] Monitor error logs
- [ ] Set up backup strategy
- [ ] Configure monitoring (e.g., Sentry, LogRocket)

## Monitoring

### PM2 Monitoring
```bash
# View logs
pm2 logs not-a-label

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Nginx Logs
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill the process
   kill -9 <PID>
   ```

2. **PM2 not starting**
   ```bash
   # Check PM2 logs
   pm2 logs
   # Restart PM2
   pm2 restart all
   ```

3. **Nginx 502 Bad Gateway**
   - Check if the application is running
   - Verify proxy_pass URL in Nginx config
   - Check PM2 status

## Backup Strategy

1. **Database Backup**
   ```bash
   # PostgreSQL backup
   pg_dump -U postgres notalabel > backup_$(date +%Y%m%d).sql
   ```

2. **File Backup**
   ```bash
   # Backup uploads directory
   tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/uploads
   ```

## Security Considerations

- Always use HTTPS in production
- Keep dependencies updated
- Use strong passwords for database and admin accounts
- Enable firewall (ufw) and only allow necessary ports
- Regular security audits
- Implement rate limiting
- Use environment variables for sensitive data

## Support

For deployment support, please:
1. Check the troubleshooting section
2. Review application logs
3. Contact support at support@not-a-label.com