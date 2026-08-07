# Authentication Quick Start

## Start the Application

```bash
# Terminal 1: Install dependencies (first time only)
npm install

# Terminal 2: Start both frontend and backend
npm run dev:full

# OR run separately:
npm run dev          # Frontend on http://localhost:5173
npm run server       # Backend on http://localhost:5000
```

## Test Login in Browser

### **Method 1: Admin Login (Easiest)**
1. Open http://localhost:5173 in your browser
2. Click "Login / Sign Up" in the navbar
3. Enter:
   - Username: `admin`
   - Password: `admin123`
4. Click Login
5. **Expected**: Redirect to `/admin` dashboard (admin can manage artworks)
6. Click your username in navbar and "Logout" to test logout

### **Method 2: Create New Account**
1. Open http://localhost:5173
2. Click "Login / Sign Up"
3. Switch to "Sign Up" tab
4. Fill in:
   - Username: anything (e.g., `myuser@example.com`)
   - Password: anything (e.g., `MyPassword123`)
   - Confirm Password: same as above
5. Click "Create Account"
6. **Expected**: Redirect to `/order` page (regular users can submit orders)
7. You should see your username in the navbar

### **Method 3: Google OAuth (After Setup)**
*Only works if GOOGLE_CLIENT_ID is configured in `.env`*
1. Open http://localhost:5173/auth
2. Click "Continue with Google" button
3. Follow Google's login flow
4. **Expected**: Auto-login and redirect

## Check Browser Console for Logs

Open browser DevTools (F12) and check Console tab:

**Successful login should show logs like:**
```
App init: Token exists: true length=187
App init: Verifying token with /api/auth/me
App init: Token verification success, user: {username: "admin", id: 1, role: "admin"}
API: Posting login request for username: admin
API: Login response received: {user: {...}, token: "..."}
Token saved to localStorage, length: 187
Current user set to: {...}
```

**If errors occur**, you'll see messages like:
```
Login API error: ...
Failed to load backend data: ...
```

These logs help identify exactly where the issue is.

## What You Should See

### After Admin Login
- Navbar shows `@admin` and Logout button
- "Dashboard" link appears in navbar
- Click Dashboard to see:
  - Artworks management section
  - Pricing settings
  - Client requests/orders

### After Regular User Login
- Navbar shows your username and Logout button
- "Order Sketch" link appears in navbar
- Click "Order Sketch" to see:
  - Form to submit custom commission
  - List of your previous orders
  - Order status tracking

## Troubleshooting

**Issue**: Login button doesn't work or shows error
- Check browser console for error messages
- Verify backend is running on http://localhost:5000
- Try admin login first to verify setup

**Issue**: After login, still on auth page or redirects wrong way
- Check localStorage (F12 → Application → LocalStorage)
- Should have a `token` key with JWT value
- If missing, login didn't work

**Issue**: "Cannot read property 'username' of null"
- Backend isn't returning user data correctly
- Verify backend is running: `curl http://localhost:5000/api/artworks`

**Issue**: Login works but can't access protected pages
- Check Authorization header is being sent
- In DevTools Network tab, check API request headers
- Should have: `Authorization: Bearer <token>`

## Environment Configuration

The app uses `.env` file for configuration:

```env
PORT=5000                          # Backend port
JWT_SECRET=art_website_secret...   # Token signing key
GOOGLE_CLIENT_ID=                  # Optional: for Google OAuth
CLOUDINARY_CLOUD_NAME=             # Optional: for image hosting
```

## Database

Authentication uses SQLite database at `server/database.sqlite`

**Tables involved:**
- `users` - username, password_hash, role, google_id
- `client_requests` - user orders
- `artworks` - artwork gallery (admin-only to modify)

**Default admin user is created automatically:**
- Username: `admin`
- Password: `admin123`
- Role: `admin`

## API Testing (Without Browser)

Use curl or Postman to test API directly:

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq .

# 2. Copy the "token" value and test protected endpoint
TOKEN="<paste-token-here>"
curl -X GET http://localhost:5000/api/requests \
  -H "Authorization: Bearer $TOKEN" \
  | jq .
```

## Success Criteria ✓

Authentication is working correctly when:
- ✓ Admin can login and access `/admin`
- ✓ New users can signup and access `/order`
- ✓ Logout clears token and redirects to home
- ✓ Protected routes redirect to `/auth` if not logged in
- ✓ Admin endpoints deny access to regular users
- ✓ Tokens work for multiple requests (token persists)
- ✓ Browser console shows no errors during auth flow
