# Quick Deploy Guide

Deploy Quotla to production in 5 minutes.

## Fastest Way: Deploy to Vercel

### 1. One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/quotla)

Click the button above and follow the prompts.

### 2. Manual Deploy

**Step 1:** Go to [vercel.com/new](https://vercel.com/new)

**Step 2:** Sign in with GitHub

**Step 3:** Import your repository

**Step 4:** Add environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=
EXCHANGERATE_API_KEY=
NEXT_PUBLIC_APP_URL=
```

**Step 5:** Click Deploy

Done! Your app will be live in 2-3 minutes.

---

## Alternative: Deploy to Netlify

**Step 1:** Go to [app.netlify.com](https://app.netlify.com)

**Step 2:** Click "Add new site" → "Import an existing project"

**Step 3:** Choose GitHub and select your repository

**Step 4:** Add the same environment variables

**Step 5:** Click "Deploy site"

---

## After Deployment

### Update Supabase Settings

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Update:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

### Test Your Deployment

Visit your live site and test:

- Sign up / Sign in
- Create a quote
- Generate invoice
- Export to PDF
- AI chat assistant
- Currency conversion

---

## Environment Variables Checklist

Make sure you have all these:

- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] At least one AI provider key (Anthropic/OpenAI/Google)
- [ ] EXCHANGERATE_API_KEY
- [ ] NEXT_PUBLIC_APP_URL (your deployment URL)

---

## Troubleshooting

**Build fails?**
- Run `npm run build` locally first
- Check all environment variables are set

**App loads but features don't work?**
- Verify Supabase URL configuration
- Check API keys are valid
- Look at browser console for errors

**Need help?**
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
- Review build logs in Vercel/Netlify dashboard

---

## Custom Domain

### Vercel
1. Settings → Domains → Add domain
2. Follow DNS instructions
3. Update NEXT_PUBLIC_APP_URL

### Netlify
1. Domain settings → Add custom domain
2. Follow DNS instructions
3. Update NEXT_PUBLIC_APP_URL

---

## Continuous Deployment

Every time you push to GitHub:
- Main branch → Production deployment
- Other branches → Preview deployments

Your app is now live and will auto-deploy on every push!
