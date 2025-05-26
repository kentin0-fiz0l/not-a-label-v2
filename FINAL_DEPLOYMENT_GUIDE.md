# Not a Label - Final Deployment & Operations Guide

## 🚀 IMMEDIATE ACTION ITEMS

### 1. Server Access & Deployment

```bash
# SSH into your production server
ssh root@147.182.252.146

# Add GitHub Actions SSH key (REQUIRED for auto-deployment)
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEtx7egTTfUwnj+WYVDw59EW3EUK0B7FpsxiaDfzc4FS github-actions@not-a-label.art" >> ~/.ssh/authorized_keys

# Clone and deploy the application
cd /opt
git clone https://github.com/kentin0-fiz0l/not-a-label-v2.git not-a-label
cd not-a-label

# Set up environment variables
cp .env.production.example .env.production
nano .env.production  # Add your API keys and secrets

# Run the automated setup script
./scripts/automated-server-setup.sh

# Deploy the application
npm install
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Run production optimizations
./scripts/production-optimization.sh
```

### 2. Critical Configuration Required

**API Keys to Add to .env.production:**
```env
# Stripe (REQUIRED for payments)
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_ARTIST_PRICE_ID=price_your_artist_plan_id
STRIPE_PRO_PRICE_ID=price_your_pro_plan_id
STRIPE_LABEL_PRICE_ID=price_your_label_plan_id

# OpenAI (REQUIRED for AI features)
OPENAI_API_KEY=sk-your-openai-key

# Email Service (REQUIRED for notifications)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password

# Analytics (OPTIONAL but recommended)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token
```

### 3. Domain & SSL Setup

```bash
# Verify DNS is pointing to your server
dig not-a-label.art
# Should return: 147.182.252.146

# SSL should already be configured, but verify:
sudo certbot certificates

# If SSL is not set up:
sudo certbot --nginx -d not-a-label.art -d www.not-a-label.art
```

### 4. Database Initialization

```bash
# Create the database schema
cd /opt/not-a-label
npx prisma migrate deploy

# Seed initial data (genres, categories, etc.)
npx prisma db seed
```

## 📊 Launch Day Monitoring

### Real-Time Monitoring Dashboard

```bash
# Run the monitoring dashboard
/opt/not-a-label/scripts/launch-dashboard.sh

# In another terminal, monitor logs
pm2 logs not-a-label

# Check nginx access logs
tail -f /var/log/nginx/access.log
```

### Health Checks

```bash
# Test all systems
/opt/not-a-label/scripts/production-monitor.sh

# Check specific endpoints
curl https://not-a-label.art/api/health
curl https://not-a-label.art
```

## 💳 Stripe Configuration

1. **Create Stripe Products:**
   - Go to https://dashboard.stripe.com/products
   - Create products for Artist ($9.99), Pro ($29.99), Label ($99.99)
   - Copy the price IDs to your .env.production

2. **Configure Webhooks:**
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: https://not-a-label.art/api/webhooks/stripe
   - Select events: All subscription and payment events
   - Copy the webhook secret to .env.production

3. **Enable Production Mode:**
   - Switch from test to live keys
   - Verify payment processing works

## 📧 Email Configuration

1. **Gmail App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Generate an app-specific password
   - Add to EMAIL_SERVER_PASSWORD in .env.production

2. **Test Email Sending:**
   ```bash
   # Test from the server
   curl -X POST https://not-a-label.art/api/test-email \
     -H "Content-Type: application/json" \
     -d '{"to": "your-email@example.com"}'
   ```

## 🚦 Go-Live Checklist

- [ ] Server is accessible at https://not-a-label.art
- [ ] SSL certificate is valid and auto-renewing
- [ ] Database is initialized with schema
- [ ] Environment variables are configured
- [ ] Stripe is in production mode with webhooks
- [ ] Email sending is functional
- [ ] GitHub Actions can deploy (SSH key added)
- [ ] Monitoring scripts are running
- [ ] Backup automation is configured

## 🎯 First Week Priorities

### Day 1-2: Soft Launch
- Invite 10-20 beta users
- Monitor system performance
- Fix any critical bugs
- Gather initial feedback

### Day 3-4: Marketing Launch
- Publish blog announcement
- Share on social media
- Reach out to music communities
- Begin influencer outreach

### Day 5-7: Optimization
- Analyze user behavior
- Optimize slow queries
- Improve onboarding flow
- Plan feature iterations

## 📈 Growth Tracking

### Daily Metrics to Monitor
```sql
-- Connect to database
psql -U notalabel -d notalabel

-- Daily signups
SELECT DATE(created_at), COUNT(*) 
FROM users 
GROUP BY DATE(created_at) 
ORDER BY DATE(created_at) DESC;

-- Track uploads
SELECT DATE(created_at), COUNT(*) 
FROM tracks 
GROUP BY DATE(created_at) 
ORDER BY DATE(created_at) DESC;

-- Revenue tracking
SELECT DATE(created_at), SUM(amount) 
FROM payments 
WHERE status = 'succeeded' 
GROUP BY DATE(created_at);
```

## 🚨 Emergency Contacts & Procedures

### If Site Goes Down
1. Check server status: `ssh root@147.182.252.146`
2. Check PM2: `pm2 status`
3. Check logs: `pm2 logs not-a-label --lines 100`
4. Restart if needed: `pm2 restart not-a-label`
5. Check nginx: `systemctl status nginx`

### If Payments Fail
1. Check Stripe dashboard for errors
2. Verify webhook is receiving events
3. Check webhook logs: `grep stripe /var/log/not-a-label/app/combined.log`
4. Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### If Performance Degrades
1. Check CPU/Memory: `htop`
2. Check database connections: `sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"`
3. Clear Redis cache: `redis-cli FLUSHALL`
4. Scale PM2 workers: `pm2 scale not-a-label +2`

## 🎉 Post-Launch Success Checklist

### Week 1 Goals
- [ ] 100+ registered users
- [ ] 10+ paid subscriptions
- [ ] <500ms average response time
- [ ] Zero critical errors
- [ ] 99.9% uptime

### Month 1 Goals
- [ ] 1,000+ registered users
- [ ] 150+ paid subscriptions ($1,500 MRR)
- [ ] 50+ tracks uploaded daily
- [ ] 5+ enterprise inquiries
- [ ] 4.5+ star user satisfaction

### Month 3 Goals
- [ ] 10,000+ registered users
- [ ] 1,500+ paid subscriptions ($15,000 MRR)
- [ ] First enterprise client signed
- [ ] Mobile app in development
- [ ] Series of funding conversations started

## 📞 Support Resources

### Technical Support
- GitHub Issues: https://github.com/kentin0-fiz0l/not-a-label-v2/issues
- Discord Community: [Create Discord server for users]
- Email: support@not-a-label.art

### Business Inquiries
- Enterprise Sales: enterprise@not-a-label.art
- Partnerships: partnerships@not-a-label.art
- Investors: investors@not-a-label.art

---

## 🏁 YOU'RE READY TO LAUNCH!

The Not a Label platform is fully built, documented, and ready for production deployment. Follow this guide to go live and start transforming the music industry.

**Remember:** The first 48 hours are critical. Monitor everything closely, respond quickly to issues, and gather as much user feedback as possible.

**Good luck with your launch! 🚀🎵**