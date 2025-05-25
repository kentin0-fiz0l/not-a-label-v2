#!/bin/bash

# Restore Script for Not a Label
# Restores application from backup

set -e

# Configuration
BACKUP_BASE_DIR="/opt/backups/not-a-label"
APP_DIR="/opt/not-a-label"
DB_NAME="notalabel"
DB_USER="notalabel"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

# Function to list available backups
list_backups() {
    echo "Available backups:"
    echo "=================="
    ls -la "$BACKUP_BASE_DIR"/not-a-label-backup-*.tar.gz 2>/dev/null | awk '{print NR")", $9, "-", $6, $7, $8}' || echo "No backups found"
}

# Get backup to restore
if [ -z "$1" ]; then
    list_backups
    echo ""
    echo "Usage: $0 <backup-file-path>"
    echo "Example: $0 $BACKUP_BASE_DIR/not-a-label-backup-20240525_120000.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    error "Backup file not found: $BACKUP_FILE"
fi

log "Starting restore from: $BACKUP_FILE"

# Extract backup
TEMP_DIR=$(mktemp -d)
log "Extracting backup to temporary directory..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Find the backup directory
BACKUP_DIR=$(find "$TEMP_DIR" -maxdepth 1 -type d -name "20*" | head -1)
if [ -z "$BACKUP_DIR" ]; then
    error "Invalid backup format"
fi

# Show backup manifest
if [ -f "$BACKUP_DIR/manifest.json" ]; then
    log "Backup manifest:"
    cat "$BACKUP_DIR/manifest.json"
    echo ""
fi

# Confirmation
echo -e "${YELLOW}WARNING: This will restore the application from backup.${NC}"
echo "This will:"
echo "- Stop the application"
echo "- Restore the database (existing data will be lost)"
echo "- Restore application files"
echo "- Restore uploads"
echo "- Restart the application"
echo ""
read -p "Are you sure you want to continue? (yes/NO): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled"
    exit 0
fi

# Stop application
log "Stopping application..."
pm2 stop not-a-label || warning "PM2 app not running"

# Backup current state before restore
log "Creating safety backup of current state..."
mkdir -p "$BACKUP_BASE_DIR/pre-restore"
pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_BASE_DIR/pre-restore/database_pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz" || warning "Could not backup current database"

# Restore database
log "Restoring database..."
DB_BACKUP=$(find "$BACKUP_DIR" -name "database_*.sql.gz" | head -1)
if [ -f "$DB_BACKUP" ]; then
    # Drop and recreate database
    sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS ${DB_NAME};
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
EOF
    
    # Restore from backup
    gunzip -c "$DB_BACKUP" | sudo -u postgres psql -U "$DB_USER" "$DB_NAME"
    success "Database restored"
else
    warning "No database backup found"
fi

# Restore application files
log "Restoring application files..."
APP_BACKUP=$(find "$BACKUP_DIR" -name "app_files_*.tar.gz" | head -1)
if [ -f "$APP_BACKUP" ]; then
    # Create backup of current files
    mv "$APP_DIR" "$APP_DIR.bak.$(date +%Y%m%d_%H%M%S)" || warning "Could not backup current app files"
    
    # Create new app directory and extract
    mkdir -p "$APP_DIR"
    tar -xzf "$APP_BACKUP" -C "$APP_DIR"
    success "Application files restored"
else
    warning "No application files backup found"
fi

# Restore uploads
log "Restoring uploads..."
UPLOADS_BACKUP=$(find "$BACKUP_DIR" -name "uploads_*.tar.gz" | head -1)
if [ -f "$UPLOADS_BACKUP" ]; then
    rm -rf "$APP_DIR/uploads"
    tar -xzf "$UPLOADS_BACKUP" -C "$APP_DIR"
    success "Uploads restored"
else
    warning "No uploads backup found"
fi

# Restore environment file
log "Restoring environment file..."
ENV_BACKUP=$(find "$BACKUP_DIR" -name "env_production_*.txt" | head -1)
if [ -f "$ENV_BACKUP" ]; then
    cp "$ENV_BACKUP" "$APP_DIR/.env.production"
    success "Environment file restored"
else
    warning "No environment file backup found"
fi

# Restore ecosystem config
log "Restoring PM2 ecosystem config..."
ECO_BACKUP=$(find "$BACKUP_DIR" -name "ecosystem_config_*.js" | head -1)
if [ -f "$ECO_BACKUP" ]; then
    cp "$ECO_BACKUP" "$APP_DIR/ecosystem.config.js"
    success "PM2 ecosystem config restored"
fi

# Restore Nginx config
log "Restoring Nginx configuration..."
NGINX_BACKUP=$(find "$BACKUP_DIR" -name "nginx_config_*.conf" | head -1)
if [ -f "$NGINX_BACKUP" ]; then
    cp "$NGINX_BACKUP" /etc/nginx/sites-available/not-a-label
    nginx -t && systemctl reload nginx
    success "Nginx configuration restored"
fi

# Install dependencies and rebuild
log "Installing dependencies..."
cd "$APP_DIR"
npm install

log "Building application..."
npm run build

# Start application
log "Starting application..."
pm2 start ecosystem.config.js
pm2 save

# Cleanup
rm -rf "$TEMP_DIR"

success "Restore completed successfully!"
echo ""
echo "Post-restore checklist:"
echo "1. Check application: https://not-a-label.art"
echo "2. Check PM2 status: pm2 status"
echo "3. Check logs: pm2 logs not-a-label"
echo "4. Verify database: sudo -u postgres psql -U $DB_USER -d $DB_NAME -c '\\dt'"
echo ""
echo "If issues occur, pre-restore database backup is at:"
echo "$BACKUP_BASE_DIR/pre-restore/"