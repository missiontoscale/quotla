# Quotla

A professional business management platform for creating quotes and invoices with AI-powered content generation.

## Features

- **Professional Quote & Invoice Management**: Create, edit, and track business documents with customizable line items, automatic tax calculations, and multi-currency support
- **AI-Powered Content Generation**: Generate professional service descriptions 
- **Client Management**: Store and manage client information with full contact details and history
- **Business Profile**: Customize your business profile with logo, company details, and branding
- **Blog System**: Public blog with comment moderation for engagement
- **Newsletter**: Email subscription system for marketing
- **Admin Dashboard**: Manage comments and view subscribers
- **Enterprise Security**: Row-level security, rate limiting, and comprehensive audit logging

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **AI**: Anthropic Claude 3.5 Sonnet
- **Storage**: Supabase Storage (for logos)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- An Anthropic API key

### Installation

1. Clone the repository:
```bash
cd quotla
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials
   - Add your Anthropic API key

4. Set up the database:
   - Go to your Supabase project SQL Editor
   - Run the SQL script in `supabase-schema.sql`
   - This will create all tables, policies, and triggers

5. Set up Supabase Storage:
   - Go to Storage in Supabase Dashboard
   - Create a new bucket called `business-assets`
   - Set it to public
   - Add RLS policies for authenticated users

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Required environment variables (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)
- `ANTHROPIC_API_KEY`: Your Anthropic API key for AI features
- `NEXT_PUBLIC_APP_URL`: Your application URL (for production)

## Key Features Explained

### AI Description Generation

When creating quotes or invoices, click "Generate with AI" on any line item. Describe your service in plain language, and AI will generate a professional description.

Example:
- Input: "Website design for small business with 5 pages"
- Output: Professional, detailed description suitable for client-facing documents

### Security Features

- **Row Level Security**: Users can only access their own data
- **Rate Limiting**: Prevents spam and abuse (5 comments per hour)
- **Password Requirements**: Strong password validation with complexity rules
- **File Upload Security**: Validates file types and sizes, prevents malicious uploads
- **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
- **Audit Logging**: Track security events and admin actions

### Multi-Currency Support

Supports 8 major currencies:
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- JPY (Japanese Yen)
- CNY (Chinese Yuan)
- INR (Indian Rupee)

## Project Structure

```
quotla/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── ai/             # AI generation endpoints
│   │   ├── blog/           # Blog comment submission
│   │   └── newsletter/     # Newsletter subscription
│   ├── admin/              # Admin dashboard
│   ├── blog/               # Public blog pages
│   ├── clients/            # Client management
│   ├── dashboard/          # Main dashboard
│   ├── invoices/           # Invoice management
│   ├── newsletter/         # Newsletter subscription page
│   ├── quotes/             # Quote management
│   ├── settings/           # User settings
│   ├── login/              # Authentication
│   └── signup/             # User registration
├── components/             # Reusable React components
├── contexts/              # React contexts (Auth)
├── lib/                   # Utility libraries
│   ├── ai/               # AI integration
│   ├── supabase/         # Database clients
│   └── utils/            # Helper functions
├── types/                # TypeScript type definitions
├── supabase-schema.sql   # Database schema
└── README.md            # This file
```

## Usage Guide

### For Regular Users

1. **Sign Up**: Create an account with email and secure password
2. **Complete Profile**: Add your business information and logo in Settings
3. **Add Clients**: Go to Clients and add your customer information
4. **Create Quotes**: Use AI to generate professional descriptions
5. **Create Invoices**: Convert quotes to invoices or create new ones
6. **Track Status**: Monitor document status from the dashboard

### For Admins

Admins have additional capabilities:
1. **Moderate Comments**: Approve or reject blog comments
2. **View Subscribers**: See newsletter subscriber list
3. **Access Audit Logs**: Review security events

To make a user an admin:
```sql
UPDATE profiles SET is_admin = true WHERE email = 'admin@example.com';
```

## Database Schema

The application uses the following main tables:
- `profiles`: User business profiles
- `clients`: Client information
- `quotes` & `quote_items`: Quote documents
- `invoices` & `invoice_items`: Invoice documents
- `blog_posts` & `blog_comments`: Blog system
- `newsletter_subscribers`: Email subscribers
- `rate_limits`: Rate limiting tracking
- `audit_logs`: Security audit trail

All tables have Row Level Security (RLS) policies to ensure data isolation.

## Security Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use strong passwords** - The app enforces this, but ensure your Supabase/Anthropic accounts also use them
3. **Enable email confirmation** - Configure Supabase Auth for production
4. **Set up proper CORS** - Configure allowed domains in production
5. **Regular backups** - Use Supabase's backup features
6. **Monitor audit logs** - Review security events regularly

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Important Production Steps

1. Set `NEXT_PUBLIC_APP_URL` to your production URL
2. Enable email confirmation in Supabase Auth settings
3. Configure email templates in Supabase
4. Set up proper domain for Supabase project
5. Review and adjust rate limits for production traffic

## Troubleshooting

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check if RLS policies are properly set up
- Ensure you ran the complete SQL schema

### AI Generation Not Working
- Verify Anthropic API key is valid
- Check API usage limits
- Review browser console for errors

### File Upload Issues
- Ensure `business-assets` bucket exists in Supabase Storage
- Verify bucket is set to public
- Check file size limits (max 2MB)

## License

This project is proprietary software developed for Mission To Scale.

## Support

For issues or questions, please contact the development team.

---

Built with Next.js, Supabase, and Anthropic Claude
