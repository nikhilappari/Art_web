# Deployment Guide: Supabase + Vercel

## Step 1: Create Supabase Project

1. **Sign up/Login to Supabase**
   - Go to https://supabase.com
   - Click "Start your project"
   - Choose GitHub or email signup

2. **Create New Project**
   - Organization: Create new or use existing
   - Project name: `art-web-prod` (or your choice)
   - Password: Save securely!
   - Region: Choose closest to your users

3. **Get Connection String**
   - In Supabase dashboard, go to **Settings → Database**
   - Find "Connection string" (POSTGRESQL)
   - Copy the connection string (looks like): `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
   - Replace `[PASSWORD]` with your database password

## Step 2: Setup Environment Variables

Create `.env.production` file in project root:

```
# Database (from Supabase)
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres?sslmode=require

# JWT & Auth
JWT_SECRET=your-very-secure-random-secret-key-min-32-chars

# Server
PORT=5000
NODE_ENV=production

# Cloudinary (optional, for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Step 3: Prepare Backend for Production

The app uses both SQLite (local) and PostgreSQL (production).

**Configuration:**
- If `DATABASE_URL` env var is set → Uses PostgreSQL
- If not set → Falls back to SQLite (local development)

This is automatically handled in `server/index.js`.

## Step 4: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Select "Y" to link to existing project or create new
   - Add environment variables when prompted

### Option B: GitHub Integration (Easier)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment with PostgreSQL"
   git push
   ```

2. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click "Add New → Project"
   - Select your GitHub repo
   - Import project

3. **Add Environment Variables**
   - Go to **Settings → Environment Variables**
   - Add all variables from `.env.production`
   - Especially important: `DATABASE_URL`, `JWT_SECRET`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## Step 5: Verify Deployment

1. **Check Build Logs**
   - Vercel shows logs during deployment
   - Look for "Backend Server is running" message

2. **Test Backend Endpoints**
   ```bash
   curl https://your-vercel-domain.vercel.app/api/artworks
   curl -X POST https://your-vercel-domain.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

3. **Test Frontend**
   - Visit your Vercel domain
   - Try login with admin/admin123
   - Test Explore Gallery
   - Upload test artwork (if admin)

## Step 6: Update API Base URL (if needed)

If frontend and backend are on different domains:

Edit `src/utils/api.js`:
```javascript
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.vercel.app/api'
  : 'http://localhost:5000/api';
```

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` is correct in Vercel
- Check Supabase IP allowlist (Settings → Networking)
- Ensure SSL mode is enabled: `?sslmode=require`

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are installed
- Verify Node version (v18+ recommended)

### 502 Bad Gateway
- Check server logs: Vercel → Deployments → Logs
- Verify backend is responding: `curl https://your-domain.vercel.app/health`

### No Data in Database
- First deploy creates empty tables
- Use admin credentials (admin/admin123) to login
- Tables auto-populate sample data on first run

## Production Checklist

- [ ] DATABASE_URL configured in Vercel
- [ ] JWT_SECRET set (random, secure)
- [ ] NODE_ENV set to "production"
- [ ] Vercel domain domain noted
- [ ] Admin credentials updated (change password!)
- [ ] Backend endpoints tested
- [ ] Authentication tested
- [ ] Gallery displays artworks
- [ ] File uploads working (if Cloudinary configured)

## Local Development (Still Using SQLite)

```bash
npm run dev:full
```
- Uses SQLite locally
- No DATABASE_URL needed
- Automatic seeding on first run

## Production Commands

```bash
# Build frontend
npm run build

# Start production server
NODE_ENV=production node server/index.js
```

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs
