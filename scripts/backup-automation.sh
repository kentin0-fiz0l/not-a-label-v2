#!/bin/bash

# Backup Automation Script for Not a Label
# Performs comprehensive backups with rotation and optional cloud upload

set -e

# Configuration
BACKUP_BASE_DIR="/opt/backups/not-a-label"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_BASE_DIR/$TIMESTAMP"
RETENTION_DAYS=7
APP_DIR="/opt/not-a-label"
DB_NAME="notalabel"
DB_USER="notalabel"

# Cloud backup settings (optional)
ENABLE_S3_BACKUP=${ENABLE_S3_BACKUP:-false}
S3_BUCKET=${S3_BUCKET:-""}
AWS_PROFILE=${AWS_PROFILE:-"default"}

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

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "Starting backup process..."

# 1. Database backup
log "Backing up PostgreSQL database..."
pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/database_${TIMESTAMP}.sql.gz"
if [ $? -eq 0 ]; then
    success "Database backup completed"
else
    error "Database backup failed"
fi

# 2. Application files backup
log "Backing up application files..."
tar -czf "$BACKUP_DIR/app_files_${TIMESTAMP}.tar.gz" \
    -C "$APP_DIR" \
    --exclude="node_modules" \
    --exclude=".next" \
    --exclude="logs" \
    --exclude=".git" \
    --exclude="uploads" \
    .
if [ $? -eq 0 ]; then
    success "Application files backup completed"
else
    error "Application files backup failed"
fi

# 3. Uploads backup
if [ -d "$APP_DIR/uploads" ] && [ "$(ls -A $APP_DIR/uploads)" ]; then
    log "Backing up user uploads..."
    tar -czf "$BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz" -C "$APP_DIR" uploads
    if [ $? -eq 0 ]; then
        success "Uploads backup completed"
    else
        warning "Uploads backup failed"
    fi
else
    warning "No uploads to backup"
fi

# 4. Environment files backup
log "Backing up environment files..."
cp "$APP_DIR/.env.production" "$BACKUP_DIR/env_production_${TIMESTAMP}.txt" 2>/dev/null || warning "No .env.production found"
cp "$APP_DIR/ecosystem.config.js" "$BACKUP_DIR/ecosystem_config_${TIMESTAMP}.js" 2>/dev/null || warning "No ecosystem.config.js found"

# 5. Nginx configuration backup
log "Backing up Nginx configuration..."
cp /etc/nginx/sites-available/not-a-label "$BACKUP_DIR/nginx_config_${TIMESTAMP}.conf" 2>/dev/null || warning "No Nginx config found"

# 6. Create backup manifest
log "Creating backup manifest..."
cat > "$BACKUP_DIR/manifest.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "date": "$(date)",
  "hostname": "$(hostname)",
  "backup_contents": {
    "database": "database_${TIMESTAMP}.sql.gz",
    "app_files": "app_files_${TIMESTAMP}.tar.gz",
    "uploads": "uploads_${TIMESTAMP}.tar.gz",
    "env_file": "env_production_${TIMESTAMP}.txt",
    "ecosystem": "ecosystem_config_${TIMESTAMP}.js",
    "nginx": "nginx_config_${TIMESTAMP}.conf"
  },
  "sizes": {
    "database": "$(du -h $BACKUP_DIR/database_${TIMESTAMP}.sql.gz 2>/dev/null | cut -f1)",
    "app_files": "$(du -h $BACKUP_DIR/app_files_${TIMESTAMP}.tar.gz 2>/dev/null | cut -f1)",
    "uploads": "$(du -h $BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz 2>/dev/null | cut -f1)",
    "total": "$(du -sh $BACKUP_DIR | cut -f1)"
  }
}
EOF

# 7. Create compressed archive of entire backup
log "Creating compressed backup archive..."
cd "$BACKUP_BASE_DIR"
tar -czf "not-a-label-backup-${TIMESTAMP}.tar.gz" "$TIMESTAMP"

# 8. Cloud backup (if enabled)
if [ "$ENABLE_S3_BACKUP" = true ] && [ -n "$S3_BUCKET" ]; then
    log "Uploading backup to S3..."
    if command -v aws &> /dev/null; then
        aws s3 cp "not-a-label-backup-${TIMESTAMP}.tar.gz" "s3://${S3_BUCKET}/backups/" --profile "$AWS_PROFILE"
        if [ $? -eq 0 ]; then
            success "Backup uploaded to S3"
        else
            warning "Failed to upload backup to S3"
        fi
    else
        warning "AWS CLI not installed, skipping S3 upload"
    fi
fi

# 9. Cleanup old backups
log "Cleaning up old backups..."
find "$BACKUP_BASE_DIR" -name "not-a-label-backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_BASE_DIR" -type d -name "20*" -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true

# 10. Generate backup report
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
BACKUP_COUNT=$(find "$BACKUP_BASE_DIR" -name "not-a-label-backup-*.tar.gz" | wc -l)

cat > "$BACKUP_BASE_DIR/latest-backup-report.txt" << EOF
Not a Label Backup Report
========================
Timestamp: $TIMESTAMP
Date: $(date)
Backup Size: $BACKUP_SIZE
Total Backups: $BACKUP_COUNT
Retention: $RETENTION_DAYS days

Files Backed Up:
$(ls -la "$BACKUP_DIR")

Disk Usage:
$(df -h "$BACKUP_BASE_DIR")
EOF

success "Backup completed successfully!"
log "Backup location: $BACKUP_DIR"
log "Compressed archive: $BACKUP_BASE_DIR/not-a-label-backup-${TIMESTAMP}.tar.gz"

# Send notification (optional - requires mail setup)
# echo "Backup completed at $(date). Size: $BACKUP_SIZE" | mail -s "Not a Label Backup Success" admin@not-a-label.art