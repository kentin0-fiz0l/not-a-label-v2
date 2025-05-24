#!/bin/bash

# Not a Label - Backup Script
# Creates backups of database and important files

set -e

echo "💾 Not a Label - Backup System"
echo "==============================="
echo "$(date)"
echo ""

# Configuration
BACKUP_DIR="/var/backups/not-a-label"
DATE=$(date +"%Y%m%d_%H%M%S")
APP_DIR="/root/not-a-label-standalone"
DB_NAME="notalabel"
DB_USER="postgres"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup for $DATE..."

# Database backup
echo "🗄️ Backing up database..."
if command -v pg_dump &> /dev/null; then
    pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_DIR/database_$DATE.sql"
    if [ $? -eq 0 ]; then
        echo "✅ Database backup completed: database_$DATE.sql"
        # Compress the backup
        gzip "$BACKUP_DIR/database_$DATE.sql"
        echo "✅ Database backup compressed"
    else
        echo "❌ Database backup failed"
    fi
else
    echo "⚠️ pg_dump not found, skipping database backup"
fi

# Application files backup
echo "📁 Backing up application files..."
if [ -d "$APP_DIR" ]; then
    tar -czf "$BACKUP_DIR/app_files_$DATE.tar.gz" -C "$APP_DIR" . --exclude=node_modules --exclude=.next/cache --exclude=.git
    if [ $? -eq 0 ]; then
        echo "✅ Application files backup completed: app_files_$DATE.tar.gz"
    else
        echo "❌ Application files backup failed"
    fi
else
    echo "⚠️ Application directory not found: $APP_DIR"
fi

# Environment variables backup
echo "🔧 Backing up environment configuration..."
if [ -f "$APP_DIR/.env.local" ]; then
    cp "$APP_DIR/.env.local" "$BACKUP_DIR/env_$DATE.backup"
    echo "✅ Environment backup completed: env_$DATE.backup"
else
    echo "⚠️ Environment file not found"
fi

# Nginx configuration backup
echo "🌐 Backing up Nginx configuration..."
if [ -d "/etc/nginx/sites-available" ]; then
    tar -czf "$BACKUP_DIR/nginx_config_$DATE.tar.gz" /etc/nginx/sites-available /etc/nginx/nginx.conf 2>/dev/null
    echo "✅ Nginx configuration backup completed"
else
    echo "⚠️ Nginx configuration not found"
fi

# SSL certificates backup
echo "🔒 Backing up SSL certificates..."
if [ -d "/etc/letsencrypt" ]; then
    tar -czf "$BACKUP_DIR/ssl_certs_$DATE.tar.gz" /etc/letsencrypt 2>/dev/null
    echo "✅ SSL certificates backup completed"
else
    echo "⚠️ SSL certificates not found"
fi

# Clean up old backups (keep last 7 days)
echo "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "*.backup" -mtime +7 -delete 2>/dev/null || true
echo "✅ Old backups cleaned up (kept last 7 days)"

# Show backup summary
echo ""
echo "📊 Backup Summary:"
echo "=================="
echo "Backup Directory: $BACKUP_DIR"
echo "Backup Date: $DATE"
echo ""
echo "Files created:"
ls -lh "$BACKUP_DIR"/*"$DATE"* 2>/dev/null || echo "No backup files found"

echo ""
echo "💾 Backup completed successfully!"
echo "📁 Location: $BACKUP_DIR"