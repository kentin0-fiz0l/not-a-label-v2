# Not a Label Production Infrastructure

This document provides a comprehensive overview of the production infrastructure, deployment processes, and maintenance procedures for the Not a Label platform.

## 🏗️ Infrastructure Overview

- **Domain**: https://not-a-label.art
- **Server**: DigitalOcean Droplet (Ubuntu)
- **IP Address**: 147.182.252.146
- **Tech Stack**: Next.js, PostgreSQL, Redis, Nginx, PM2

## 🚀 Deployment

### Automated Deployment (GitHub Actions)

Every push to the `main` branch triggers automatic deployment:

1. **Pre-deployment snapshot** is created for rollback capability
2. **Latest code** is pulled from GitHub
3. **Dependencies** are installed
4. **Application** is built
5. **Health check** verifies deployment success
6. **Automatic rollback** if health check fails

### Manual Deployment

```bash
ssh root@147.182.252.146
cd /opt/not-a-label
git pull origin main
npm install
npm run build
pm2 restart not-a-label
```

## 🔧 Server Management Scripts

All scripts are located in `/opt/not-a-label/scripts/` on the server and in `scripts/` in the repository.

### 1. **Automated Server Setup** (`automated-server-setup.sh`)
Complete server setup from scratch including all dependencies, SSL, and security configurations.

```bash
./scripts/automated-server-setup.sh
```

### 2. **Production Monitoring** (`production-monitor.sh`)
Comprehensive health checks for DNS, network, SSL, and application status.

```bash
./scripts/production-monitor.sh
```

### 3. **Backup Automation** (`backup-automation.sh`)
Creates full backups of database, files, and configuration with optional S3 upload.

```bash
# Run backup
./scripts/backup-automation.sh

# Enable S3 backup
ENABLE_S3_BACKUP=true S3_BUCKET=my-bucket ./scripts/backup-automation.sh
```

### 4. **Restore Backup** (`restore-backup.sh`)
Restores application from backup with safety checks.

```bash
# List available backups
./scripts/restore-backup.sh

# Restore specific backup
./scripts/restore-backup.sh /opt/backups/not-a-label/not-a-label-backup-20240525_120000.tar.gz
```

### 5. **Deployment Rollback** (`deployment-rollback.sh`)
Provides safe rollback mechanism for failed deployments.

```bash
# Create snapshot
./scripts/deployment-rollback.sh create "before major update"

# List rollback points
./scripts/deployment-rollback.sh list

# Perform rollback
./scripts/deployment-rollback.sh rollback deployment_20240525_120000
```

### 6. **Logging & Monitoring** (`logging-monitoring.sh`)
Sets up comprehensive logging, monitoring, and alerting infrastructure.

```bash
# Real-time dashboard
/opt/not-a-label/scripts/monitor-dashboard.sh

# Health monitoring
/opt/not-a-label/scripts/health-monitor.sh

# Performance analysis
/opt/not-a-label/scripts/performance-monitor.sh

# Log analysis
/opt/not-a-label/scripts/analyze-logs.sh
```

## 📊 Monitoring & Logs

### Log Locations
- **Application logs**: `/var/log/not-a-label/app/`
- **Nginx logs**: `/var/log/nginx/`
- **Monitoring reports**: `/var/log/not-a-label/monitoring/`
- **PM2 logs**: `pm2 logs not-a-label`

### Health Endpoints
- **Application health**: https://not-a-label.art/api/health
- **Nginx status**: `systemctl status nginx`
- **Database status**: `systemctl status postgresql`
- **Redis status**: `systemctl status redis`

## 🔐 Security

### SSL/TLS
- Certificates managed by Let's Encrypt
- Auto-renewal configured via Certbot
- Force HTTPS redirect enabled

### Firewall (UFW)
- SSH (port 22)
- HTTP (port 80)
- HTTPS (port 443)

### Fail2ban
- SSH brute force protection
- Nginx rate limiting
- Bad bot protection

## 🔄 Maintenance

### Daily Tasks (Automated)
- Database backups at 2 AM
- Log rotation
- Performance monitoring
- Health checks every 5 minutes

### Weekly Tasks
- Review monitoring reports
- Check disk usage
- Update dependencies (if needed)
- Security updates

### Monthly Tasks
- Full system backup
- Performance optimization review
- Security audit
- SSL certificate verification

## 🚨 Troubleshooting

### Site is Down
1. Check monitoring: `./scripts/production-monitor.sh`
2. SSH to server: `ssh root@147.182.252.146`
3. Check services:
   ```bash
   pm2 status
   systemctl status nginx postgresql redis
   ```
4. Review logs: `pm2 logs not-a-label`
5. Use recovery script: `./scripts/production-recovery.sh`

### Database Issues
```bash
# Check PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -d notalabel

# Restore from backup if needed
./scripts/restore-backup.sh
```

### Performance Issues
```bash
# Real-time monitoring
htop
iotop
nethogs

# Check PM2 cluster status
pm2 monit

# Analyze performance logs
./scripts/performance-monitor.sh
```

## 📝 Environment Variables

Key environment variables in `.env.production`:
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://not-a-label.art`
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `NEXTAUTH_SECRET` - Authentication secret
- API keys for external services

## 🔑 Access Management

### SSH Access
1. Generate SSH key for new user
2. Add public key to server: `~/.ssh/authorized_keys`
3. Test connection: `ssh user@147.182.252.146`

### GitHub Actions Access
The deployment workflow requires these secrets:
- `HOST`: Server IP address
- `USERNAME`: SSH username
- `SSH_KEY`: Private SSH key for deployment

To add the GitHub Actions key to server:
```bash
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEtx7egTTfUwnj+WYVDw59EW3EUK0B7FpsxiaDfzc4FS github-actions@not-a-label.art" >> ~/.ssh/authorized_keys
```

## 📈 Scaling

The application is configured for horizontal scaling:
- PM2 cluster mode with max instances
- PostgreSQL connection pooling
- Redis for session management
- Static assets served by Nginx

To adjust scaling:
```bash
# Edit ecosystem config
nano /opt/not-a-label/ecosystem.config.js

# Change instances from 'max' to specific number
instances: 4

# Restart PM2
pm2 restart not-a-label
```

## 🆘 Emergency Contacts

- **Server Provider**: DigitalOcean
- **Domain Registrar**: (Your registrar)
- **SSL Issues**: Let's Encrypt community

---

For additional help, check the scripts in the `scripts/` directory or run them with no arguments to see usage information.