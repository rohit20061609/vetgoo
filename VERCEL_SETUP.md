# Vercel Deployment Guide for VetGo

This guide will help you deploy VetGo to Vercel with automated CI/CD using GitHub Actions.

## Prerequisites

- GitHub account with access to the repository
- Vercel account (free tier available at [vercel.com](https://vercel.com))
- PostgreSQL database (Supabase recommended for free tier)
- All required API keys and secrets

## Step 1: Create Vercel Project

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"** or **"Add New"**
3. Select **"Import Git Repository"**
4. Authorize GitHub and select the `rohit20061609/vetgoo` repository
5. Click **"Import"**

### Option B: Via Vercel CLI

```bash
npm install -g vercel
vercel link
```

## Step 2: Configure Environment Variables

### In Vercel Dashboard:

1. Go to your project settings → **"Environment Variables"**
2. Add the following variables:

```
DATABASE_URL=postgresql://...         # Your PostgreSQL connection string
NEXTAUTH_SECRET=your-secret-32+chars  # Generate: openssl rand -base64 32
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
ANTHROPIC_API_KEY=sk-ant-...
UPLOADTHING_SECRET=...
UPLOADTHING_APP_ID=...
RESEND_API_KEY=...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

3. Set environment for each variable:
   - **Production** (main branch)
   - **Preview** (develop branch and PRs)
   - **Development** (optional)

## Step 3: Setup GitHub Actions Secrets

For automated deployment, add these secrets to your GitHub repository:

1. Go to **Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Add the following secrets:

```
VERCEL_TOKEN          # Get from Vercel: Account → Tokens
VERCEL_ORG_ID         # Get from Vercel project settings
VERCEL_PROJECT_ID     # Get from Vercel project settings
DATABASE_URL          # PostgreSQL connection string
NEXTAUTH_SECRET       # Same as Vercel env var
GOOGLE_CLIENT_ID      # Same as Vercel env var
GOOGLE_CLIENT_SECRET  # Same as Vercel env var
STRIPE_SECRET_KEY     # Same as Vercel env var
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
ANTHROPIC_API_KEY
UPLOADTHING_SECRET
UPLOADTHING_APP_ID
RESEND_API_KEY
```

### How to get Vercel tokens:

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **"Create"**
3. Give it a name (e.g., "GitHub Actions")
4. Copy the token and add as `VERCEL_TOKEN` secret

### How to get Org ID and Project ID:

1. Go to your Vercel project
2. Click **"Settings" → "General"**
3. Look for **"Project ID"** and scroll up to find **"Org ID"**

## Step 4: Setup Database Migrations

### Automatic Migrations (Recommended):

Add this to your Vercel project settings under **"Build & Development Settings"**:

**Build Command:**
```bash
npm run build && npx prisma db push
```

**Start Command:**
```bash
npm start
```

### Manual Migrations:

If automatic migrations fail, SSH into your Vercel deployment and run:

```bash
vercel env pull .env.production.local
npx prisma db push --skip-generate
```

## Step 5: Deploy

### Automatic Deployment

The GitHub Actions workflow will automatically:

1. **Test & Lint** on all pushes and PRs
2. **Deploy to Preview** on push to `develop` branch or PR
3. **Deploy to Production** on push to `main` branch

Just push to trigger deployment:

```bash
git push origin main  # Production deployment
# or
git push origin develop  # Preview deployment
```

### Manual Deployment

```bash
# Production
vercel deploy --prod

# Preview
vercel deploy
```

## Step 6: Configure Domain (Optional)

1. In Vercel dashboard, go to **"Settings → Domains"**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update environment variables with your domain URL

## Step 7: Stripe Webhook Setup

1. Go to Stripe Dashboard → **Developers → Webhooks**
2. Click **"Add an endpoint"**
3. Enter: `https://your-domain/api/payments/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
5. Copy webhook secret and add as `STRIPE_WEBHOOK_SECRET` in Vercel

## Troubleshooting

### Build Fails

```bash
# Clear build cache
vercel env pull
rm -rf .next node_modules
npm install
vercel deploy --prod
```

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check PostgreSQL is accessible from Vercel IP range
- For Supabase: Go to Project Settings → Database → Connection String

### Authentication Not Working

- Ensure `NEXTAUTH_SECRET` is set (min 32 chars)
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

### Secrets Not Loading

```bash
# Verify secrets are set
vercel env list

# Pull down secrets to local
vercel env pull .env.production.local
```

## Monitoring & Logs

View deployment logs:

```bash
# Via Vercel CLI
vercel logs

# Via Dashboard
# Settings → Analytics & Monitoring → Logs
```

## Rollback Deployment

If something breaks:

1. Go to **Deployments** tab
2. Find the previous working deployment
3. Click **"Promote to Production"**

Or via CLI:

```bash
vercel promote <deployment-url>
```

## Performance Tips

1. **Image Optimization**: Vercel automatically optimizes images
2. **Edge Functions**: Consider using Edge Runtime for API routes
3. **Analytics**: Enable Vercel Analytics in project settings
4. **Speed Insights**: Monitor real user metrics

## Security Checklist

- [x] All secrets are stored in Vercel (not in code)
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set up rate limiting on API endpoints
- [ ] Enable Web Application Firewall (Vercel Pro)
- [ ] Regular security updates for dependencies
- [ ] Database backups configured
- [ ] SSL certificate installed

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Next Steps

1. Push changes to GitHub
2. Watch deployment in GitHub Actions or Vercel Dashboard
3. Test your live application
4. Configure custom domain
5. Monitor performance and errors
