#!/bin/bash

# Deployment Rollback Script for Not a Label
# Provides safe rollback mechanism for failed deployments

set -e

# Configuration
APP_DIR="/opt/not-a-label"
ROLLBACK_DIR="/opt/not-a-label-rollback"
MAX_ROLLBACK_VERSIONS=3

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

# Function to create deployment snapshot
create_snapshot() {
    local snapshot_name="deployment_$(date +%Y%m%d_%H%M%S)"
    local snapshot_dir="$ROLLBACK_DIR/$snapshot_name"
    
    log "Creating deployment snapshot: $snapshot_name"
    
    mkdir -p "$snapshot_dir"
    
    # Save current git commit
    cd "$APP_DIR"
    git rev-parse HEAD > "$snapshot_dir/git_commit.txt"
    git branch --show-current > "$snapshot_dir/git_branch.txt"
    
    # Copy built files
    cp -r "$APP_DIR/.next" "$snapshot_dir/" 2>/dev/null || warning "No .next directory found"
    cp "$APP_DIR/package.json" "$snapshot_dir/"
    cp "$APP_DIR/package-lock.json" "$snapshot_dir/" 2>/dev/null || true
    cp "$APP_DIR/.env.production" "$snapshot_dir/" 2>/dev/null || true
    cp "$APP_DIR/ecosystem.config.js" "$snapshot_dir/" 2>/dev/null || true
    
    # Save PM2 process info
    pm2 info not-a-label > "$snapshot_dir/pm2_info.txt" 2>/dev/null || true
    
    # Create metadata
    cat > "$snapshot_dir/metadata.json" << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "snapshot_name": "$snapshot_name",
    "git_commit": "$(cat $snapshot_dir/git_commit.txt)",
    "git_branch": "$(cat $snapshot_dir/git_branch.txt)",
    "node_version": "$(node --version)",
    "npm_version": "$(npm --version)",
    "created_by": "$(whoami)",
    "reason": "${1:-manual}"
}
EOF
    
    success "Snapshot created: $snapshot_dir"
    
    # Cleanup old snapshots
    cleanup_old_snapshots
}

# Function to list available rollback points
list_rollbacks() {
    echo "Available rollback points:"
    echo "========================="
    
    if [ -d "$ROLLBACK_DIR" ]; then
        for snapshot in $(ls -1dr "$ROLLBACK_DIR"/deployment_* 2>/dev/null | head -$MAX_ROLLBACK_VERSIONS); do
            if [ -f "$snapshot/metadata.json" ]; then
                echo ""
                echo "Snapshot: $(basename $snapshot)"
                cat "$snapshot/metadata.json" | grep -E "(timestamp|git_commit|reason)" | sed 's/[",]//g'
            fi
        done
    else
        echo "No rollback points available"
    fi
}

# Function to perform rollback
perform_rollback() {
    local snapshot_name=$1
    local snapshot_dir="$ROLLBACK_DIR/$snapshot_name"
    
    if [ ! -d "$snapshot_dir" ]; then
        error "Snapshot not found: $snapshot_name"
    fi
    
    log "Starting rollback to: $snapshot_name"
    
    # Confirm rollback
    echo -e "${YELLOW}WARNING: This will rollback the deployment${NC}"
    cat "$snapshot_dir/metadata.json" 2>/dev/null || true
    echo ""
    read -p "Are you sure you want to continue? (yes/NO): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Rollback cancelled"
        exit 0
    fi
    
    # Create current snapshot before rollback
    create_snapshot "pre-rollback"
    
    # Stop application
    log "Stopping application..."
    pm2 stop not-a-label || warning "PM2 app not running"
    
    # Restore git commit
    if [ -f "$snapshot_dir/git_commit.txt" ]; then
        local target_commit=$(cat "$snapshot_dir/git_commit.txt")
        log "Rolling back to git commit: $target_commit"
        cd "$APP_DIR"
        git fetch origin
        git checkout "$target_commit"
    fi
    
    # Restore built files
    if [ -d "$snapshot_dir/.next" ]; then
        log "Restoring built files..."
        rm -rf "$APP_DIR/.next"
        cp -r "$snapshot_dir/.next" "$APP_DIR/"
    fi
    
    # Restore configuration files
    [ -f "$snapshot_dir/.env.production" ] && cp "$snapshot_dir/.env.production" "$APP_DIR/"
    [ -f "$snapshot_dir/ecosystem.config.js" ] && cp "$snapshot_dir/ecosystem.config.js" "$APP_DIR/"
    
    # Install exact dependencies from snapshot
    if [ -f "$snapshot_dir/package.json" ]; then
        log "Restoring dependencies..."
        cp "$snapshot_dir/package.json" "$APP_DIR/"
        [ -f "$snapshot_dir/package-lock.json" ] && cp "$snapshot_dir/package-lock.json" "$APP_DIR/"
        cd "$APP_DIR"
        npm ci || npm install
    fi
    
    # Start application
    log "Starting application..."
    cd "$APP_DIR"
    pm2 start ecosystem.config.js
    pm2 save
    
    success "Rollback completed!"
    
    # Verify application health
    sleep 5
    if curl -sf "http://localhost:3000/api/health" > /dev/null; then
        success "Application health check passed"
    else
        error "Application health check failed - manual intervention required"
    fi
}

# Function to cleanup old snapshots
cleanup_old_snapshots() {
    if [ -d "$ROLLBACK_DIR" ]; then
        local count=$(ls -1d "$ROLLBACK_DIR"/deployment_* 2>/dev/null | wc -l)
        if [ $count -gt $MAX_ROLLBACK_VERSIONS ]; then
            log "Cleaning up old snapshots..."
            ls -1dt "$ROLLBACK_DIR"/deployment_* | tail -n +$((MAX_ROLLBACK_VERSIONS + 1)) | xargs rm -rf
        fi
    fi
}

# Main script logic
case "${1:-}" in
    "create")
        create_snapshot "${2:-manual}"
        ;;
    "list")
        list_rollbacks
        ;;
    "rollback")
        if [ -z "$2" ]; then
            echo "Usage: $0 rollback <snapshot_name>"
            echo ""
            list_rollbacks
            exit 1
        fi
        perform_rollback "$2"
        ;;
    "auto")
        # Automatic mode for CI/CD integration
        create_snapshot "pre-deployment"
        ;;
    *)
        echo "Usage: $0 {create|list|rollback|auto} [options]"
        echo ""
        echo "Commands:"
        echo "  create [reason]     Create a new deployment snapshot"
        echo "  list               List available rollback points"
        echo "  rollback <name>    Rollback to a specific snapshot"
        echo "  auto               Automatic snapshot (for CI/CD)"
        echo ""
        echo "Examples:"
        echo "  $0 create 'before major update'"
        echo "  $0 list"
        echo "  $0 rollback deployment_20240525_120000"
        exit 1
        ;;
esac