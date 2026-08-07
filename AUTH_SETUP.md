# Authentication System - Setup & Testing Guide

## Overview
The application now has a fully functional authentication system with support for:
- **Email/Password authentication** (signup and login)
- **Google OAuth** (when configured)
- **Role-based access control** (admin vs regular users)

## Backend API Endpoints

### Authentication Endpoints
- **POST /api/auth/signup** - Create new user account
  ```json
  Request: { "username": "email@example.com", "password": "securepass" }
  Response: { "user": { "id": 1, "username": "...", "role": "user" }, "token": "jwt..." }
  ```

- **POST /api/auth/login** - Login with credentials
  ```json
  Request: { "username": "email@example.com", "password": "securepass" }
  Response: { "user": { "id": 1, "username": "...", "role": "user" }, "token": "jwt..." }
  ```

- **GET /api/auth/me** - Get current user info (requires Authorization header)
  ```
  Header: Authorization: Bearer <token>
  Response: { "user": { "id": 1, "username": "...", "role": "user" } }
  ```

- **POST /api/auth/google** - Google OAuth (when GOOGLE_CLIENT_ID is configured)
  ```json
  Request: { "credential": "google_id_token" }
  Response: { "user": {...}, "token": "jwt..." }
  ```

- **GET /api/auth/google/client-id** - Get Google Client ID configuration
  ```
  Response: { "clientId": "your-client-id" }
  ```

## Testing Authentication

### Quick Test - Default Admin User
The system comes with a default admin user:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin` (can manage artworks, view all orders)

### Test Using curl

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Response will include a JWT token in the "token" field

# 2. Use token for protected endpoint
curl -X GET http://localhost:5000/api/requests \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

### Test Using Frontend (Browser)

1. Open `http://localhost:5173` in your browser
2. Click "Login / Sign Up" in the navbar
3. **Option A - Admin Login**:
   - Username: `admin`
   - Password: `admin123`
   - Click Login → Should redirect to `/admin` dashboard

4. **Option B - Create New Account**:
   - Switch to "Sign Up" tab
   - Enter a username (email format recommended)
   - Enter a password (min 8 characters recommended)
   - Confirm password
   - Click "Create Account" → Should redirect to `/order` page

5. **View your orders**:
   - After login, go to "Order Sketch" page
   - Use the form to submit a custom commission request
   - View request status in "Commission History" tab

## Role-Based Features

### Admin User (role: 'admin')
- Access `/admin` dashboard
- View and manage artworks gallery
- View all client requests/orders
- Accept/reject quotes and manage order status
- Update pricing settings
- Update transformation gallery

### Regular User (role: 'user')
- Access `/order` page
- Submit custom commission requests
- View only their own orders
- Approve/decline quotes from artist
- Cannot access admin dashboard or create artworks

## Browser Console Debugging

The system includes comprehensive logging to help debug issues. Check browser console (F12) for:

- `[App]` - App initialization logs
- `[AuthPage]` - Authentication page logs
- `[API]` - API client logs
- Authentication flow details

## Google OAuth Setup (Optional)

### 1. Create Google OAuth Application
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project
- Enable Google+ API
- Create OAuth 2.0 credentials (Web application)
- Add authorized JavaScript origins: `http://localhost:5173`
- Add authorized redirect URIs: `http://localhost:5173/auth`
- Copy the Client ID

### 2. Configure Environment
Edit `.env` file in the project root:
```
GOOGLE_CLIENT_ID=your-client-id-here
```

### 3. Test Google Login
- The "Continue with Google" button should now appear on the auth page
- Click it and follow Google's login flow
- User will be created/authenticated automatically

## Common Issues & Troubleshooting

### Issue: "Login Failed: Invalid username or password"
**Solution**: Verify username and password are correct. For testing, use:
- Username: `admin`
- Password: `admin123`

### Issue: "API Error: Status 403"
**Solution**: The user doesn't have permission for that action. Ensure:
- You're using admin account for admin-only actions
- Token is valid and not expired

### Issue: "API Error: Status 401"
**Solution**: Missing or invalid authentication token. Ensure:
- You're sending the Authorization header: `Bearer <token>`
- Token hasn't expired (valid for 7 days by default)

### Issue: Google Login Button Not Showing
**Solution**: GOOGLE_CLIENT_ID is not configured. Either:
1. Configure it in `.env` file (recommended)
2. Use email/password login instead

### Issue: "localhost:5173 refused to connect"
**Solution**: Vite dev server isn't running. Start it with:
```bash
npm run dev:full
# or individually
npm run dev          # Frontend only
npm run server       # Backend only
```

## Security Features

- ✓ Passwords hashed with bcryptjs
- ✓ JWT tokens with 7-day expiration
- ✓ Role-based access control
- ✓ Protected routes require authentication
- ✓ Admin endpoints check role before allowing access
- ✓ Tokens stored in localStorage (frontend) and verified on backend

## Next Steps

1. **Test email/password authentication** - Create an account and verify the flow
2. **(Optional) Set up Google OAuth** - Follow the Google OAuth setup steps above
3. **Test role-based features**:
   - Admin: Log in as admin and visit `/admin`
   - User: Create account and visit `/order`
4. **Deploy** - When ready for production, use appropriate `GOOGLE_CLIENT_ID` and JWT secrets

## File Locations

- Backend auth logic: `server/index.js` (lines 72-259)
- Database schema: `server/db.js`
- Frontend auth page: `src/pages/AuthPage.jsx`
- API client: `src/utils/api.js`
- Protected routes: `src/components/ProtectedRoute.jsx`
- Environment config: `.env`
