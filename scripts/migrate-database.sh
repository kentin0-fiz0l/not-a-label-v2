#!/bin/bash

# Database Migration Script
# Run this to set up or update the database schema

set -e

echo "🗄️  Not a Label V2 - Database Migration"
echo "======================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to run migrations for a service
migrate_service() {
    local service=$1
    echo -e "${YELLOW}Running migrations for ${service}...${NC}"
    
    if [ -d "services/${service}/prisma" ]; then
        cd services/${service}
        
        # Generate Prisma client
        npx prisma generate
        
        # Run migrations
        if [ "$ENV" = "production" ]; then
            npx prisma migrate deploy
        else
            npx prisma migrate dev
        fi
        
        cd ../..
        echo -e "${GREEN}✓ ${service} migrations complete${NC}"
    else
        echo -e "${YELLOW}⚠ No migrations found for ${service}${NC}"
    fi
}

# Check environment
ENV=${NODE_ENV:-development}
echo "Environment: $ENV"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Run migrations for each service
echo -e "${YELLOW}Starting database migrations...${NC}"

migrate_service "user-service"
migrate_service "ai-service"
migrate_service "music-service"
migrate_service "analytics-service"
migrate_service "distribution-service"
migrate_service "notification-service"
migrate_service "payment-service"

echo -e "${GREEN}✅ All database migrations complete!${NC}"

# Seed data in development
if [ "$ENV" = "development" ] && [ "$1" = "--seed" ]; then
    echo -e "${YELLOW}Seeding development data...${NC}"
    
    # Run seed scripts
    node scripts/seed-data.js
    
    echo -e "${GREEN}✓ Database seeded${NC}"
fi