# Netlify Deployment Guide - Quotla v3.0.0

Complete guide for deploying Quotla to Netlify.

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://www.netlify.com)
2. **Supabase Project**: Active Supabase project (or create one at [supabase.com](https://supabase.com))
3. **External AI API**: Your FastAPI backend deployed and accessible (optional, if using AI features)
4. **GitHub Repository**: Push your code to GitHub (recommended for automatic deployments)

## Step 1: Install Netlify Next.js Plugin

Before deploying, install the required Netlify plugin:

```bash
npm install --save-dev @netlify/plugin-nextjs
```

## Step 2: Configure Environment Variables in Netlify

Go to your Netlify site dashboard → **Site settings** → **Environment variables**, and add the following:

### Required Variables

| Variable Name | Where to Get It | Example Value |
|--------------|----------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API (Service Role - Keep Secret!) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_APP_URL` | Your Netlify site URL | `https://your-app.netlify.app` |

### Security Variables (Required for Production)

| Variable Name | How to Generate | Example |
|--------------|-----------------|---------|
| `CSRF_SECRET` | Run: `openssl rand -base64 32` | `K7x9mP2vQ5wR8tY3nB6cF1gH4jL0sA9z...` |
| `SESSION_SECRET` | Run: `openssl rand -base64 32` | `A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6...` |

### Optional Variables (if using AI features)

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `EXTERNAL_AI_API_URL` | Your FastAPI backend URL | `https://your-api.herokuapp.com` |

### How to Set Environment Variables on Netlify:

1. Go to: **Site settings** → **Environment variables** → **Add a variable**
2. For each variable above:
   - Enter the **Key** (variable name)
   - Enter the **Value**
   - Select **All scopes** (or specific branch if needed)
   - Click **Create variable**

## Step 3: Configure Build Settings

In Netlify dashboard → **Site settings** → **Build & deploy**:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `20` (set in netlify.toml)

## Step 4: Update Supabase Settings

### Update Redirect URLs:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Netlify URLs:

**Site URL:**
```
https://your-app.netlify.app
```

**Redirect URLs (Add both):**
```
https://your-app.netlify.app/auth/callback
http://localhost:3000/auth/callback
```

### Enable Required Auth Providers:

1. Go to **Authentication** → **Providers**
2. Enable:
   - Email (already enabled by default)
   - Google OAuth (if using Google sign-in)
     - Add your Google OAuth credentials
     - Use redirect URL: `https://your-app.netlify.app/auth/callback`

## Step 5: Deploy Options

### Option A: Deploy via GitHub (Recommended)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Prepare for Netlify deployment v3.0.0"
git push origin main
```

2. In Netlify:
   - Click **Add new site** → **Import an existing project**
   - Connect to GitHub
   - Select your repository
   - Netlify will auto-detect Next.js settings
   - Click **Deploy site**

3. Netlify will automatically deploy on every push to main branch

### Option B: Deploy via Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Initialize your site:
```bash
netlify init
```

4. Deploy:
```bash
netlify deploy --prod
```

### Option C: Manual Deploy via Netlify UI

1. Build your site locally:
```bash
npm run build
```

2. In Netlify dashboard:
   - Click **Add new site** → **Deploy manually**
   - Drag and drop your `.next` folder

(Note: This method doesn't support automatic deployments)

## Step 6: Generate Security Secrets

Run these commands on your local machine to generate secure random strings:

```bash
# For CSRF_SECRET
openssl rand -base64 32

# For SESSION_SECRET
openssl rand -base64 32
```

Copy the output and add to Netlify environment variables.

## Step 7: Post-Deployment Checklist

After deployment, verify:

- [ ] Site loads at your Netlify URL
- [ ] Login/signup functionality works
- [ ] Supabase connection is working
- [ ] Google OAuth works (if enabled)
- [ ] Dashboard loads for authenticated users
- [ ] AI features work (if external API is configured)
- [ ] Version shows as 3.0.0 in footer
- [ ] No console errors in browser DevTools
- [ ] SSL certificate is active (https://)

## Step 8: Custom Domain (Optional)

1. In Netlify: **Domain settings** → **Add custom domain**
2. Follow instructions to:
   - Add DNS records
   - Wait for DNS propagation (can take up to 48 hours)
   - Netlify will automatically provision SSL certificate

3. Update environment variables:
   - Change `NEXT_PUBLIC_APP_URL` to your custom domain
   - Update Supabase redirect URLs to use custom domain

## Troubleshooting

### Build Fails

**Error**: TypeScript errors during build
- **Solution**: The config has `ignoreBuildErrors: true` set, but you can fix actual errors by running `npm run type-check` locally

**Error**: Module not found
- **Solution**: Ensure all dependencies are in `package.json`, run `npm install` and commit the changes

### Runtime Errors

**Error**: "Invalid login credentials" not showing properly
- **Solution**: Already fixed in v3.0.0 - ensure you deployed latest code

**Error**: Supabase connection fails
- **Solution**: Double-check environment variables are set correctly in Netlify

**Error**: 404 on page refresh
- **Solution**: Netlify redirects are configured in `netlify.toml`

### Environment Variables Not Working

- Make sure you added them in Netlify dashboard (not just .env file)
- Redeploy the site after adding new variables
- Variables prefixed with `NEXT_PUBLIC_` are exposed to browser
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or secrets with `NEXT_PUBLIC_`

## Monitoring & Logs

View logs in Netlify:
- **Deploy logs**: Site dashboard → **Deploys** → Click on a deploy
- **Function logs**: Site dashboard → **Functions** → Select a function
- **Analytics**: Site dashboard → **Analytics**

## Rollback

If something goes wrong:
1. Go to **Deploys** tab
2. Find a previous working deploy
3. Click **Publish deploy** to rollback

## Updating

For future updates:

1. Push changes to GitHub:
```bash
git add .
git commit -m "Update description"
git push origin main
```

2. Netlify will automatically rebuild and deploy

## Security Recommendations

- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` secret - never expose in frontend code
- [ ] Use strong random values for `CSRF_SECRET` and `SESSION_SECRET`
- [ ] Enable 2FA on Netlify account
- [ ] Set up Supabase Row Level Security (RLS) policies
- [ ] Review Netlify access logs regularly
- [ ] Keep dependencies updated: `npm audit` and `npm update`

## Additional Resources

- [Netlify Next.js Docs](https://docs.netlify.com/frameworks/next-js/overview/)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)

## Support

If you encounter issues:
1. Check Netlify build logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test locally with production environment variables

---

**Deployment Date**: _[Add date when deployed]_
**Deployed By**: _[Add your name]_
**Version**: 3.0.0
