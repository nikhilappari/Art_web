# Railway Deployment Guide

For your architecture (React + Express), the best approach is to deploy the backend and frontend separately:

## Option 1: Railway (Recommended - Free)

### Frontend Deploy to Vercel ✓
- Already configured in vercel.json
- Just build and deploy

### Backend Deploy to Railway

1. **Create Railway Account**
   - Go to: https://railway.app
   - Sign up with GitHub (recommended)

2. **Create New Project**
   - Click "New Project"
   - Select "GitHub Repo"
   - Select `nikhilappari/Art_web`

3. **Configure Environment**
   - Add environment variables:
     ```
     DATABASE_URL = postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require
     JWT_SECRET = [your-secret]
     NODE_ENV = production
     PORT = 5000
     ```

4. **Deploy**
   - Railway auto-detects and builds
   - Get domain from Railway dashboard

5. **Update Frontend**
   - In `src/utils/api.js`, update API_BASE URL
   - Point to your Railway backend URL

---

## Option 2: Vercel (Both Frontend + Backend)

For Vercel to work with Express, we need to restructure using serverless functions. This is more complex.

Would you like to:
1. Use Railway for backend (simpler) ✓
2. Deploy both to Vercel (needs restructuring)

---

## For Now: Use Vercel + Railway

This is the recommended setup for your project:

**Frontend**: Vercel (free tier)
**Backend**: Railway (free tier, $5/month after free credits)
**Database**: Supabase PostgreSQL (free tier)

All three have generous free tiers!
