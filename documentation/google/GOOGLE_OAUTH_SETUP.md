# Google OAuth Setup Guide

## Prerequisites
Before implementing Google Sign-in, you need to configure OAuth credentials in Google Cloud Console and Supabase.

## Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Select your project or create a new one

2. **Create OAuth 2.0 Credentials**
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Quotla OAuth"

3. **Configure Authorized Redirect URIs**
   Add these redirect URIs (replace with your actual Supabase URL):
   ```
   https://rjrsjnzxqhemksdjcybi.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback (for local development)
   ```

4. **Get Your Credentials**
   After creating, you'll receive:
   - Client ID: Something like `xxxxx.apps.googleusercontent.com`
   - Client Secret: A secret string

5. **Configure OAuth Consent Screen**
   - User Type: External (for testing) or Internal (for G Suite)
   - Add required info: App name, user support email, developer contact
   - Add scopes: `email`, `profile`, `openid`

## Step 2: Supabase Dashboard Configuration

1. **Go to Supabase Authentication Settings**
   - Visit: https://supabase.com/dashboard/project/rjrsjnzxqhemksdjcybi/auth/providers
   - Find "Google" in the providers list

2. **Enable Google Provider**
   - Toggle "Enable Google provider" to ON
   - Paste your Google Client ID
   - Paste your Google Client Secret
   - Click "Save"

3. **Configure Redirect URLs**
   - Supabase will automatically use: `https://rjrsjnzxqhemksdjcybi.supabase.co/auth/v1/callback`
   - This should match what you added in Google Cloud Console

## Step 3: Update Environment Variables

Update your `.env` file with the credentials:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. You should be redirected to the dashboard

## Important Notes

- **Redirect URI Must Match**: The redirect URI in Google Console MUST exactly match the one Supabase uses
- **HTTPS Required**: Google OAuth requires HTTPS in production (localhost is exempt)
- **Scopes**: By default, Supabase requests `email` and `profile` scopes
- **User Data**: User profile data (email, name, avatar) will be automatically stored in Supabase auth.users table

## Troublesion

### "redirect_uri_mismatch" Error
- Check that the redirect URI in Google Console matches Supabase's callback URL exactly
- Make sure there are no trailing slashes

### "access_denied" Error
- Check OAuth consent screen configuration
- Ensure your email is added as a test user (if app is in testing mode)

### No User Data After Sign-in
- Check Supabase logs in Dashboard → Logs → Auth
- Verify the auth callback route is working correctly

## Production Considerations

1. **Verify OAuth Consent Screen**
   - Submit for Google verification if needed
   - Add privacy policy and terms of service URLs

2. **Update Redirect URIs**
   - Add your production domain's callback URL
   - Remove localhost URLs from Google Console

3. **Security**
   - Keep Client Secret secure (never expose in client-side code)
   - Use environment variables for all sensitive data
   - Enable rate limiting in Supabase

## References

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Supabase Google Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [OAuth 2.0 Flow](https://developers.google.com/identity/protocols/oauth2)
