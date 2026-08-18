# KINGZ CRM - Railway Deployment Guide

## Prerequisites

- Railway.app account (free tier available)
- GitHub repository (this project)
- Supabase project credentials

## Deployment Steps

### 1. Connect GitHub to Railway

1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect your GitHub account
5. Select the `Server.xs` repository

### 2. Create Project on Railway

1. In Railway dashboard, create a new project
2. Add a service and select "GitHub repo"
3. Point to your `Server.xs` repository
4. Railway will auto-detect Node.js and deploy

### 3. Configure Environment Variables

In Railway dashboard for your KINGZ CRM service:

1. Go to **Variables** tab
2. Add these environment variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
PORT=3000
NODE_ENV=production
```

### 4. Configure Build Settings

Railway should auto-detect:
- **Start Command**: `node src/index.js`
- **Build Command**: None needed (uses Nixpacks)

### 5. Deploy

1. Railway will automatically deploy when you push to main
2. Check the **Logs** tab to monitor deployment
3. Once deployed, Railway provides a public URL

### 6. Setup Supabase

Before first use, run the database schema:

1. Go to your Supabase SQL Editor
2. Copy and run all commands from `SCHEMA.sql`
3. This sets up the CRM tables

## After Deployment

### Access Your CRM

Your app will be available at:
```
https://[project-name]-production-[random].railway.app
```

### Health Check

Test if it's running:
```
curl https://[your-railway-url]/health
```

### Create First Contact

```bash
curl -X POST https://[your-railway-url]/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","company":"Test Co"}'
```

## Monitoring

- **Logs**: Check Railway dashboard Logs tab for errors
- **Metrics**: Monitor CPU, memory, and network usage
- **Deployments**: View deployment history

## Troubleshooting

### "Cannot find module" errors
- Railway cached node_modules. Push a new commit to trigger rebuild

### Database connection errors
- Verify SUPABASE_URL and SUPABASE_KEY are correct
- Check Supabase project is active
- Ensure SCHEMA.sql has been run

### Port issues
- Railway automatically assigns PORT - don't hardcode ports
- Environment variable PORT is set by Railway

### Cold starts
- Railway free tier may have cold starts
- Consider upgrading for faster response times

## CI/CD Pipeline

Railway automatically deploys when you:
- Push to main branch
- Create a pull request (preview deployment)

## Scaling

As your CRM grows:

1. **Upgrade Railway plan** for better resources
2. **Add caching** (Redis) for frequently accessed data
3. **Use Supabase's Edge Functions** for serverless operations
4. **Setup CDN** for static assets

## Database Backups

Railway doesn't manage database backups. Use Supabase's built-in backup features:

1. Go to Supabase Dashboard
2. Settings → Backups
3. Enable automatic backups

## Support

- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Issues**: Check Railway logs for detailed error messages
