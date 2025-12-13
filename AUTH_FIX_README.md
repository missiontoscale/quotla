# Authentication Fix Documentation

## Issues Fixed

### 1. New Account Authentication Failure
**Problem:** New user accounts couldn't access the dashboard after signup.

**Root Cause:** The database trigger `handle_new_user()` that automatically creates profiles wasn't working or wasn't installed in your Supabase database.

### 2. Manifest.json Redirect
**Problem:** The `/manifest.json` file was being intercepted by authentication middleware.

**Root Cause:** The middleware wasn't skipping `.json` files, causing them to go through authentication checks.

---

## Solutions Implemented

### Client-Side Fixes (Already Applied)

#### 1. Signup Page ([app/signup/page.tsx](app/signup/page.tsx))
- Added session establishment wait (500ms delay)
- Implemented retry logic (3 attempts) for profile creation
- Better error handling with user-friendly messages
- Changed from `.single()` to `.maybeSingle()` to avoid errors when profile doesn't exist

#### 2. Login Page ([app/login/page.tsx](app/login/page.tsx))
- Added retry logic for profile checking/creation
- Handles edge case where users exist but profiles don't
- Better error messages for profile access failures

#### 3. Middleware ([middleware.ts](middleware.ts))
- Added `.json`, `.txt`, and `.xml` to the skip list
- Manifest.json now loads without authentication checks

### Database-Side Fix (Action Required)

You need to run the SQL script in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: **[fix-profile-trigger.sql](fix-profile-trigger.sql)**
4. Copy and paste the entire contents
5. Click **Run**

**What this script does:**
- Drops and recreates the `handle_new_user()` function with better error handling
- Adds `ON CONFLICT DO NOTHING` to prevent duplicate profile errors
- Includes exception handling so user creation never fails
- Backfills profiles for any existing users without them
- Verifies the trigger is active
- Shows count of users without profiles

---

## How It Works Now

### Signup Flow
1. User submits signup form
2. Supabase creates auth user
3. **Database trigger automatically creates profile** (server-side, instant)
4. Client waits 500ms for session to establish
5. Client checks if profile exists (with 3 retries)
6. If profile doesn't exist, client creates it (fallback)
7. Redirects to dashboard

### Login Flow
1. User submits login form
2. Supabase authenticates user
3. Client checks if profile exists (with 3 retries)
4. If missing, creates profile (handles legacy accounts)
5. Redirects to dashboard

---

## Testing

After running the SQL fix, test these scenarios:

### Test 1: New Account Signup
```
1. Go to /signup
2. Create a new account with:
   - Email: test@example.com
   - Password: SecurePass123!
3. Should redirect to /dashboard successfully
4. No console errors about profile creation
```

### Test 2: Existing Account Login
```
1. Go to /login
2. Login with existing credentials
3. Should redirect to /dashboard
4. Profile should load correctly
```

### Test 3: Manifest.json
```
1. Open browser
2. Navigate to: https://your-domain.com/manifest.json
3. Should see JSON content (no redirect)
4. Check network tab - should be 200 status
```

---

## Verification Queries

Run these in Supabase SQL Editor to verify:

### Check trigger is active
```sql
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

### Check for users without profiles
```sql
SELECT COUNT(*)
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;
```
Result should be `0`.

### Check all profiles have emails
```sql
SELECT id, email, created_at
FROM profiles
WHERE email IS NULL;
```
Result should be empty.

---

## Troubleshooting

### Still getting "Profile creation error: {}"
- **Cause:** Database trigger not installed or RLS policy blocking insert
- **Fix:** Run the [fix-profile-trigger.sql](fix-profile-trigger.sql) script

### "Unable to access your profile" on login
- **Cause:** User exists but profile is missing and can't be created
- **Fix:** Check RLS policies and run the backfill query in the SQL script

### Manifest.json still redirecting
- **Cause:** Browser cache or middleware not updated
- **Fix:**
  1. Clear browser cache
  2. Restart Next.js dev server
  3. Check [middleware.ts:46](middleware.ts#L46) includes `json` in the regex

---

## Technical Details

### Why the Empty Error Object?
The error `{}` happens when Supabase's RLS policy blocks the insert but doesn't provide detailed error info to the client. The policy at `supabase-schema.sql:203-205` requires `auth.uid() = id`, which can fail if:
- Session isn't fully established
- Client is using wrong Supabase client
- Trigger should handle it (running with SECURITY DEFINER)

### Why Retry Logic?
Network latency and session propagation can take 100-500ms. The retry logic with delays ensures we give the system time to:
1. Establish the auth session
2. Propagate session to the database
3. Allow RLS policies to recognize the authenticated user

### Why Both Client & Database Fix?
- **Database trigger**: Authoritative, secure, runs with elevated permissions
- **Client fallback**: Handles edge cases, legacy users, trigger failures
- **Defense in depth**: Multiple layers ensure robustness

---

## Files Modified

1. ✅ [app/signup/page.tsx](app/signup/page.tsx) - Added profile creation with retry logic
2. ✅ [app/login/page.tsx](app/login/page.tsx) - Added profile checking/creation
3. ✅ [middleware.ts](middleware.ts) - Fixed manifest.json bypass
4. 📄 [fix-profile-trigger.sql](fix-profile-trigger.sql) - Database trigger fix (run this!)

---

## Next Steps

1. **Run the SQL script** in Supabase SQL Editor
2. **Test signup** with a new account
3. **Test login** with existing account
4. **Verify manifest.json** loads correctly
5. **Delete this README** once everything is working (optional)

---

## Support

If issues persist after running the SQL script:
1. Check Supabase logs for trigger errors
2. Verify environment variables are correct
3. Check browser console for detailed error messages
4. Ensure RLS policies are correctly configured
