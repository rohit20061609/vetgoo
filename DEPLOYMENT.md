# VetGo Setup & Deployment Guide

## Local Development Setup

### Option 1: Manual Setup

#### 1. Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Database Setup
Create a PostgreSQL database:
```bash
createdb vetgo
```

Update `.env.local`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/vetgo_db"
```

#### 4. Initialize Prisma
```bash
npm run db:push
npm run db:generate
```

#### 5. Environment Variables
Copy `.env.example` to `.env.local` and fill in all required values:
```bash
cp .env.example .env.local
```

Key variables needed:
- `NEXTAUTH_SECRET` (min 32 characters)
- `DATABASE_URL`
- `ANTHROPIC_API_KEY` (for AI features)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (for OAuth)
- `STRIPE_*_KEY` (for payment processing)

#### 6. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Option 2: Docker Compose

#### 1. Start Services
```bash
docker-compose up
```

This will:
- Start PostgreSQL database
- Install dependencies
- Run migrations
- Start development server

#### 2. Access Application
- App: [http://localhost:3000](http://localhost:3000)
- Database: `localhost:5432`

#### 3. Stop Services
```bash
docker-compose down
```

## Production Deployment

### Vercel Deployment (Recommended for Next.js)

#### 1. Prerequisites
- Vercel account
- GitHub repository

#### 2. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import GitHub repository
4. Configure project settings

#### 3. Environment Variables
Add to Vercel:
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
ANTHROPIC_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
// ... other variables
```

#### 4. Database Setup
- Create PostgreSQL on Supabase
- Use connection string in `DATABASE_URL`
- Run migrations after deployment

#### 5. Deploy
Automatic deployment on push to main branch.

### Railway Deployment

#### 1. Create Project
```bash
railway init
railway login
```

#### 2. Add Services
```bash
railway add postgresql
railway up
```

#### 3. Configure Environment
```bash
railway variables
```

Add all required environment variables

#### 4. Deploy
```bash
railway up
```

### Docker Deployment

#### 1. Build Image
```bash
docker build -t vetgo:latest .
```

#### 2. Run Container
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e ANTHROPIC_API_KEY="..." \
  vetgo:latest
```

### AWS EC2 Deployment

#### 1. Launch Instance
- Choose Ubuntu 22.04 AMI
- Instance type: t3.micro (eligible for free tier)
- Security groups: Allow 80, 443

#### 2. SSH into Instance
```bash
ssh -i key.pem ubuntu@instance-ip
```

#### 3. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 4. Install PostgreSQL
```bash
sudo apt-get install -y postgresql postgresql-contrib
```

#### 5. Clone Repository
```bash
git clone https://github.com/your-repo/vetgo.git
cd vetgo
```

#### 6. Setup Application
```bash
npm install
cp .env.example .env.local
# Edit .env.local with production values
npm run build
```

#### 7. Start Application
```bash
npm start
```

#### 8. Setup Nginx (Reverse Proxy)
```bash
sudo apt-get install -y nginx

# Create nginx config file
sudo nano /etc/nginx/sites-available/vetgo
```

Add:
```nginx
upstream vetgo {
  server 127.0.0.1:3000;
}

server {
  listen 80 default_server;
  server_name _;
  
  location / {
    proxy_pass http://vetgo;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/vetgo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 9. SSL Certificate (Let's Encrypt)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

#### 10. Process Manager (PM2)
```bash
sudo npm install -g pm2
pm2 start npm --name "vetgo" -- start
pm2 startup
pm2 save
```

## Database Migrations

### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

### Apply Migration
```bash
npx prisma db push
```

### Seed Database
Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add seed data here
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npx prisma db seed
```

## Monitoring & Logging

### Setup Logging
Install monitoring package:
```bash
npm install winston
```

### Error Tracking
Consider services like:
- Sentry
- LogRocket
- New Relic

### Performance Monitoring
- Vercel Analytics
- Google Analytics
- CloudWatch (AWS)

## Backup & Recovery

### PostgreSQL Backup
```bash
pg_dump vetgo > backup.sql
```

### Restore
```bash
psql vetgo < backup.sql
```

### Automated Backups
On Supabase:
1. Go to Database settings
2. Enable backup (7-day free retention)

## Security Checklist

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie flags
- [ ] Enable CORS properly
- [ ] Rate limiting on API
- [ ] SQL injection prevention (Prisma handles)
- [ ] XSS protection (Next.js handles)
- [ ] CSRF protection enabled
- [ ] Environment variables secured
- [ ] Database backups automated
- [ ] Regular security updates
- [ ] API key rotation

## Troubleshooting

### Database Connection Fails
```bash
# Test connection
psql postgresql://user:pass@host:5432/db
```

### Build Fails
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Authentication Issues
- Check `NEXTAUTH_SECRET` (min 32 chars)
- Verify callback URLs
- Clear cookies in browser

### API Rate Limiting
Check Anthropic API rate limits and quotas.

## Support

- Documentation: [README.md](../README.md)
- Issues: GitHub Issues
- Email: support@vetgoo.in
