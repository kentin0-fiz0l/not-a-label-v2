# Not a Label - Deployment Commands

Execute these commands in order to deploy the platform to production.

## 1. SSH into Server
```bash
ssh root@147.182.252.146
```

## 2. Clone Repository and Setup
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install system dependencies
sudo apt-get update
sudo apt-get install -y git nginx postgresql postgresql-contrib redis-server certbot python3-certbot-nginx

# Install PM2 globally
sudo npm install -g pm2

# Clone repository
cd /opt
git clone https://github.com/kentin0-fiz0l/not-a-label-v2.git not-a-label
cd not-a-label

# Install dependencies
npm install
```

## 3. Configure Environment Variables
```bash
# Copy and edit production environment
cp .env.example .env.production
nano .env.production
```

Required variables to set:
- `DATABASE_URL`: postgresql://notalabel:YourSecurePassword@localhost:5432/notalabel
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `OPENAI_API_KEY`: Your OpenAI API key
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: For S3 storage
- `SENDGRID_API_KEY`: For email sending

## 4. Setup PostgreSQL Database
```bash
# Create database and user
sudo -u postgres psql << EOF
CREATE USER notalabel WITH PASSWORD 'YourSecurePassword';
CREATE DATABASE notalabel OWNER notalabel;
GRANT ALL PRIVILEGES ON DATABASE notalabel TO notalabel;
EOF

# Run migrations
cd apps/web
npx prisma migrate deploy
cd ../..
```

## 5. Build Application
```bash
# Build all packages
npm run build
```

## 6. Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/not-a-label

# Add this configuration:
server {
    listen 80;
    server_name not-a-label.art www.not-a-label.art;

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

# Enable site
sudo ln -s /etc/nginx/sites-available/not-a-label /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Setup SSL with Certbot
```bash
sudo certbot --nginx -d not-a-label.art -d www.not-a-label.art
```

## 8. Start Services with PM2
```bash
# Start the application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup systemd -u root --hp /root
```

## 9. Configure Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 10. Health Check
```bash
# Check if services are running
pm2 status

# Check application health
curl http://localhost:3000/api/health

# Check logs
pm2 logs
```

## 11. Create Admin Account
```bash
cd apps/web
npx prisma studio
# Or use SQL directly:
sudo -u postgres psql -d notalabel << EOF
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    'admin@not-a-label.art',
    '\$2b\$10\$YourHashedPasswordHere',
    'Admin',
    'ADMIN',
    NOW(),
    NOW()
);
EOF
```

## 12. DNS Configuration
Add these records to your domain registrar:
- A record: @ → 147.182.252.146
- A record: www → 147.182.252.146

## 13. Monitor Deployment
```bash
# Watch logs
pm2 logs --lines 100

# Monitor resources
pm2 monit

# Check error logs
tail -f /var/log/nginx/error.log
```

## Troubleshooting Commands
```bash
# Restart services
pm2 restart all

# Rebuild if needed
npm run build
pm2 restart all

# Check database connection
sudo -u postgres psql -d notalabel -c "SELECT 1;"

# Test Redis
redis-cli ping
```