# 🚀 Quick Deployment Checklist

## Pre-Deployment (5 minutes)

### 1. Setup Supabase Database
- [ ] Go to https://supabase.com and sign up
- [ ] Create new project (note: save password)
- [ ] Go to Settings → Database
- [ ] Copy PostgreSQL connection string: `postgresql://postgres:...`
- [ ] Note: Replace `[password]` with the one you saved

### 2. Setup Vercel Account
- [ ] Go to https://vercel.com and sign up (GitHub recommended)
- [ ] Connect your GitHub account if not done

### 3. Prepare Environment Variables
- [ ] Generate JWT_SECRET: Open terminal and run:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  (Copy the output)

## Deployment Steps

### Option A: Deploy Using GitHub + Vercel (Easiest)

1. **Push your code to GitHub**
   ```bash
   git push origin nikhilappari-connect-backend-authentication
   ```

2. **Create Pull Request (optional but recommended)**
   - Merge to `main` branch (or create PR for review)

3. **Deploy to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New → Project"
   - Select your `Art_web` repository
   - Click "Import"

4. **Add Environment Variables**
   - Go to **Settings → Environment Variables**
   - Add these variables:
     ```
     DATABASE_URL = postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require
     JWT_SECRET = [paste your generated secret]
     NODE_ENV = production
     PORT = 5000
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-5 minutes for build to complete
   - Copy your Vercel domain (e.g., `art-web.vercel.app`)

### Option B: Deploy Using Vercel CLI

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
   vercel --prod
   ```

4. **Add Environment Variables**
   - When prompted, add environment variables
   - Or go to Vercel dashboard → Settings → Environment Variables

## Post-Deployment Verification

### 1. Test Backend API
```bash
# Get artworks (no auth needed)
curl https://your-vercel-domain.vercel.app/api/artworks

# Login
curl -X POST https://your-vercel-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. Test Frontend
- Open https://your-vercel-domain.vercel.app in browser
- Try signing in with admin/admin123
- Verify Explore Gallery shows artworks
- Check if artworks load correctly

### 3. Test Admin Features
- Login as admin
- Try uploading a new artwork
- Verify it appears in gallery

## Important Notes

✅ **Automatic Features:**
- Database tables created automatically on first run
- Default admin user (admin/admin123) created automatically
- Sample artworks seeded automatically
- SSL connection to PostgreSQL automatic

⚠️ **Important:**
- Change admin password after first deployment!
- Keep JWT_SECRET private (don't commit to GitHub)
- DATABASE_URL should have `?sslmode=require` at the end

🔧 **Switching Databases:**
- Local development (no DATABASE_URL) → Uses SQLite
- Production (DATABASE_URL set) → Uses PostgreSQL
- No code changes needed!

## Troubleshooting

### Database Connection Failed
- Verify DATABASE_URL is correct
- Check Supabase Settings → Networking for IP allowlist
- Ensure `?sslmode=require` is in connection string

### Build Failed
- Check Vercel build logs (Deployments → [latest] → Logs)
- Run `npm run build` locally to test
- Ensure all dependencies are in package.json

### 502 Bad Gateway
- Wait 1-2 minutes (server might be starting)
- Check Vercel function logs
- Verify PORT and JWT_SECRET are set

### No Artworks Showing
- This is normal on first deployment
- Admin can add artworks via dashboard
- Or database will auto-seed on next restart

## Links

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
- Your Deployed App: https://your-vercel-domain.vercel.app
- GitHub Repo: https://github.com/nikhilappari/Art_web

---

**Need help?** Read DEPLOYMENT_GUIDE.md for detailed information!
