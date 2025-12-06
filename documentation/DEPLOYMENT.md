# Quotla Deployment Guide

This guide covers deploying your Quotla application to production using Vercel or Netlify.

## Prerequisites

- GitHub repository with your code
- Environment variables from `.env` file
- Supabase project set up

## Required Environment Variables

Make sure you have these environment variables ready:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers (at least one required)
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key

# Currency API
EXCHANGERATE_API_KEY=your_exchangerate_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Option 1: Deploy to Vercel (Recommended for Next.js)

Vercel is the best choice for Next.js applications and offers the easiest deployment experience.

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

### Step 3: Add Environment Variables

In the Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add each environment variable:
   - Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Value (paste your actual value)
   - Select environments: Production, Preview, Development
3. Click **Save**

### Step 4: Deploy

1. Click **Deploy**
2. Wait for the build to complete (2-3 minutes)
3. Your app will be live at `https://your-project.vercel.app`

### Step 5: Add Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable to your custom domain

### Vercel CLI Deployment

Alternatively, deploy from your terminal:

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow the prompts to link your project
```

---

## Option 2: Deploy to Netlify

Netlify is another excellent option with a generous free tier.

### Step 1: Deploy via Netlify Dashboard

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Base directory**: (leave empty)

### Step 2: Add Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable**
3. Add each environment variable from the list above
4. Make sure to select **"Deploy" and "Branch deploys"**

### Step 3: Configure Next.js Plugin

Netlify needs a plugin for Next.js. Create a `netlify.toml` file in your project root (already created for you).

### Step 4: Deploy

1. Click **Deploy site**
2. Wait for the build to complete
3. Your app will be live at `https://your-site-name.netlify.app`

### Step 5: Add Custom Domain (Optional)

1. Go to **Domain settings** → **Add custom domain**
2. Follow the DNS configuration instructions
3. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## Option 3: Deploy to Railway

Railway offers a simple deployment experience with a generous free tier.

### Step 1: Deploy via Railway Dashboard

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect Next.js

### Step 2: Add Environment Variables

1. Go to your project → **Variables** tab
2. Add each environment variable
3. Click **Deploy**

### Step 3: Configure Domain

1. Go to **Settings** → **Networking**
2. Generate a Railway domain or add your custom domain
3. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## Post-Deployment Checklist

After deploying to any platform:

- [ ] Test the live site thoroughly
- [ ] Verify all AI providers are working
- [ ] Test quote generation and PDF export
- [ ] Test invoice creation
- [ ] Verify authentication flow (sign up, sign in, password reset)
- [ ] Test multi-currency conversion
- [ ] Check that Supabase connection is working
- [ ] Test the AI chat assistant
- [ ] Verify email functionality (if configured)
- [ ] Test on mobile devices
- [ ] Set up monitoring and error tracking (optional)

---

## Continuous Deployment

All three platforms support automatic deployments:

- **Push to main branch** → Automatic production deployment
- **Push to other branches** → Preview deployments (Vercel/Netlify)
- **Pull requests** → Preview deployments with unique URLs

---

## Supabase Configuration

Make sure your Supabase project allows your deployment URL:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your deployment URL to:
   - **Site URL**: `https://your-domain.com`
   - **Redirect URLs**: `https://your-domain.com/**`

---

## Troubleshooting

### Build Fails

- Check the build logs for specific errors
- Verify all environment variables are set correctly
- Make sure `npm run build` works locally first

### Environment Variables Not Working

- Ensure variables starting with `NEXT_PUBLIC_` are prefixed correctly
- Redeploy after adding/changing environment variables
- For Vercel: Clear build cache and redeploy

### API Routes Failing

- Check that server-side environment variables (without `NEXT_PUBLIC_`) are set
- Verify API keys are valid
- Check platform-specific logs for errors

### Supabase Connection Issues

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase Dashboard for API keys
- Ensure deployment URL is added to Supabase allowed origins

---

## Performance Optimization

After deployment:

1. Enable **Edge Functions** on Vercel for faster API responses
2. Configure **CDN caching** for static assets
3. Enable **Image Optimization** (enabled by default on Vercel)
4. Monitor **Core Web Vitals** in Vercel Analytics
5. Set up **Error Tracking** (Sentry, LogRocket, etc.)

---

## Recommended: Vercel

For the best Next.js experience, we recommend Vercel:

- Zero configuration needed
- Automatic HTTPS
- Edge network for global performance
- Best Next.js integration
- Generous free tier
- Automatic preview deployments
- Built-in analytics

Deploy now: [vercel.com/new](https://vercel.com/new)
