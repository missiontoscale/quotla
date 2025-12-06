# Quotla Setup Guide

This guide will walk you through setting up Quotla from scratch.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New Project"
4. Fill in:
   - Project name: `quotla`
   - Database password: (choose a strong password)
   - Region: (closest to your users)
5. Wait for the project to be created

## Step 3: Get Supabase Credentials

1. In your Supabase project dashboard, go to Settings → API
2. Copy the following values:
   - Project URL → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → This is your `SUPABASE_SERVICE_ROLE_KEY`

## Step 4: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Copy the key → This is your `ANTHROPIC_API_KEY`

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Open `.env` and fill in all values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 6: Set Up Database Schema

1. Go to your Supabase project
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase-schema.sql`
5. Paste it into the SQL Editor
6. Click "Run" or press Ctrl+Enter
7. Wait for all statements to execute successfully

You should see messages like:
- "Success. No rows returned"
- Multiple CREATE TABLE, CREATE INDEX, CREATE POLICY statements

## Step 7: Set Up Storage Bucket

1. In Supabase, go to "Storage" in the left sidebar
2. Click "Create a new bucket"
3. Bucket name: `business-assets`
4. Set to "Public bucket" (toggle ON)
5. Click "Create bucket"

### Configure Storage Policies

1. Click on the `business-assets` bucket
2. Go to "Policies" tab
3. Add the following policies:

**Upload Policy:**
```sql
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Read Policy:**
```sql
CREATE POLICY "Anyone can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-assets');
```

**Update Policy:**
```sql
CREATE POLICY "Users can update own logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Delete Policy:**
```sql
CREATE POLICY "Users can delete own logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 8: Configure Supabase Auth (Optional but Recommended)

For production, you should configure email confirmation:

1. Go to Authentication → Settings
2. Under "Email Auth":
   - Enable "Confirm email"
   - Customize email templates if desired
3. Under "Site URL":
   - Set to your production URL (for production deployments)
4. Under "Redirect URLs":
   - Add your production domain

## Step 9: Run the Application

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000)

## Step 10: Create Your First Admin User

1. Go to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Create your account with email and password
3. After signing up, go to Supabase → Authentication → Users
4. Find your user
5. Go to SQL Editor and run:

```sql
UPDATE profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with your actual email.

## Step 11: Test All Features

### Test Authentication
- Sign out and sign back in
- Verify you can access the dashboard

### Test Profile Settings
- Go to Settings
- Upload a business logo
- Fill in company information
- Save and verify changes persist

### Test Client Management
- Create a new client
- Edit the client
- Delete a test client

### Test Quote Creation
- Create a new quote
- Try the AI description generator
- Add multiple line items
- Save the quote

### Test Invoice Creation
- Create a new invoice
- Use AI for descriptions
- Verify calculations are correct

### Test Blog (if you create posts)
- Go to SQL Editor
- Create a test blog post:

```sql
INSERT INTO blog_posts (title, slug, content, published, published_at)
VALUES (
  'Welcome to Quotla',
  'welcome-to-quotla',
  '<h1>Welcome</h1><p>This is a test blog post.</p>',
  true,
  NOW()
);
```

- Visit /blog and verify the post appears
- Try commenting
- Go to /admin and approve the comment

### Test Newsletter
- Go to /newsletter
- Subscribe with a test email
- Check /admin to see the subscriber

## Troubleshooting

### "Failed to fetch" errors
- Check that `.env` file exists and has correct values
- Restart the dev server after changing `.env`

### Database errors
- Verify the SQL schema was executed successfully
- Check Supabase dashboard → Database → Tables to ensure all tables exist

### AI generation not working
- Verify Anthropic API key is correct
- Check that you have API credits available
- Review browser console for specific error messages

### File upload fails
- Ensure `business-assets` bucket exists
- Verify bucket is set to public
- Check that storage policies are configured correctly

### Can't access admin panel
- Verify `is_admin` is set to `true` in the profiles table
- Sign out and sign back in after changing admin status

## Production Deployment Checklist

When deploying to production:

- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Enable email confirmation in Supabase Auth
- [ ] Configure custom email templates
- [ ] Set up custom domain for Supabase (optional)
- [ ] Review and adjust rate limits
- [ ] Set up monitoring and error tracking
- [ ] Configure backups in Supabase
- [ ] Review RLS policies for production
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS properly
- [ ] Test all features in production environment

## Next Steps

- Customize the design and branding
- Add more currencies if needed
- Create blog content
- Configure email templates
- Set up analytics
- Add more features as needed

For questions or issues, refer to the main README.md file.
