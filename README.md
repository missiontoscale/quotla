# Quotla

**Empowering Small Businesses with Intelligent Document Management**

Quotla is more than a quote and invoice generator—it's your intelligent business companion. We're on a mission to help small businesses and entrepreneurs streamline operations, reduce administrative overhead, and focus on what truly matters: growing their business.

## Our Vision

We envision a world where every business owner has access to enterprise-grade tools without the enterprise complexity or cost. Quotla combines cutting-edge AI technology with intuitive design to deliver professional business documents in seconds, not hours.

### Why Quotla?

- **Speed & Efficiency**: Generate professional quotes and invoices through natural conversation—no forms, no friction
- **Intelligence Built-In**: AI-powered content generation that understands your business context
- **Built for Growth**: From your first invoice to your thousandth, Quotla scales with you
- **Professional Without the Premium**: Enterprise features accessible to businesses of all sizes

---

## ✨ Features

### Core Functionality

- **Professional Quote & Invoice Management**: Create, edit, and track business documents with customizable line items, automatic tax calculations, and multi-currency support
- **AI-Powered Document Generation**: Generate invoices and quotes from natural language using conversational AI with support for voice input
- **File Processing**: Upload PDF, DOCX, TXT, and images to extract data automatically with Vision AI
- **Smart Export Options**: Export documents as PDF, DOCX, or PNG with professional formatting
- **Client Management**: Store and manage client information with full contact details and document history
- **Business Profile**: Customize your business profile with logo, company details, tax information, and branding

### Content & Marketing

- **Blog System**: Full-featured blog with markdown support, categories, tags, and featured posts
- **Newsletter**: Email subscription system with admin management
- **Admin Dashboard**: Moderate comments, view subscribers, and manage content

### Security & Compliance

- **Row-Level Security**: Users can only access their own data
- **Rate Limiting**: Prevents spam and abuse
- **Password Requirements**: Strong password validation with complexity rules
- **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
- **Audit Logging**: Track security events and admin actions

---

## 🛠 Tech Stack

| Layer | Technology |
| ----- | ---------- |
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes + External FastAPI for AI operations |
| **Database** | Supabase (PostgreSQL with Row Level Security) |
| **Authentication** | Supabase Auth with JWT tokens |
| **AI** | External FastAPI backend (OpenAI GPT-4, Anthropic Claude, Google Gemini) |
| **Storage** | Supabase Storage for logos and file uploads |
| **Deployment** | Vercel (recommended) |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed
- A **Supabase account** and project ([Sign up free](https://supabase.com))
- A **FastAPI backend** deployed and accessible for AI operations
- **API keys** for your chosen AI provider (OpenAI, Anthropic, or Google)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd quotla
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # AI Backend Configuration
   NEXT_PUBLIC_EXTERNAL_API_BASE_URL=your_fastapi_backend_url
   EXTERNAL_API_KEY=your_api_key_for_backend
   ```

4. **Set up Supabase database**

   Run the database schema in your Supabase SQL Editor:
   - Navigate to your Supabase project dashboard
   - Go to SQL Editor
   - Create tables for: `profiles`, `clients`, `quotes`, `invoices`, `blog_posts`, `blog_comments`, `newsletter_subscribers`
   - Enable Row Level Security (RLS) policies

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Deployment

#### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

---

## 📖 Usage Guide

### Creating Documents with AI

Quotla's AI assistant can generate quotes and invoices through natural conversation.

**How it works:**

1. Click **"Intelligent generation in seconds"** on the dashboard
2. Describe what you need in plain language:
   - "Create an invoice for website design services worth $2,500 for ABC Corp"
   - "I need a quote for 50 units of product X at $100 each with 10% discount"
3. The AI will:
   - Extract client information
   - Parse line items with quantities and prices
   - Calculate totals and taxes
   - Generate a complete document
4. Review and save the generated document

**Supported inputs:**

- Text descriptions
- Voice recordings (click microphone icon)
- File uploads (PDF, DOCX, images) for data extraction

### Manual Document Creation

For traditional workflows:

1. Navigate to **Quotes** or **Invoices**
2. Click **"New Quote"** or **"New Invoice"**
3. Fill in the form:
   - Select a client (or create new)
   - Add line items with descriptions, quantities, and prices
   - Set tax rates and discounts
   - Add notes and payment terms
4. Click **"Generate with AI"** on any line item for professional descriptions
5. Save as draft or mark as sent

### Managing Clients

1. Go to **Clients** section
2. Add client details:
   - Company name
   - Contact person
   - Email and phone
   - Address
3. View client history with all associated quotes and invoices

### Exporting Documents

Documents can be exported in multiple formats:
- **PDF**: Professional print-ready format
- **DOCX**: Editable Microsoft Word document
- **PNG**: Image format for quick sharing

Click the export button on any document and choose your format.

### Blog Management

Create blog posts using markdown files:

1. Create a `.md` file in `content/blog/` directory
2. Add frontmatter metadata:

   ```yaml
   ---
   title: "Your Post Title"
   date: "2024-01-15"
   author: "Your Name"
   category: "Business Tips"
   tags: ["invoicing", "productivity"]
   featured: true
   excerpt: "Brief description of the post"
   ---
   ```

3. Write content in markdown
4. Posts automatically appear at `/blog`

**Features:**

- GitHub Flavored Markdown (GFM) support
- Automatic reading time calculation
- Category and tag filtering
- Featured posts
- SEO-friendly URLs

### Admin Features

Admins have additional capabilities accessible from the admin dashboard:

- **Comment Moderation**: Approve or reject blog comments
- **Subscriber Management**: View and export newsletter subscribers
- **Audit Logs**: Review security events and user actions

---

## 🌍 Multi-Currency Support

Quotla supports 8 major currencies with automatic formatting:

| Currency | Code | Symbol |
| -------- | ---- | ------ |
| US Dollar | USD | $ |
| Euro | EUR | € |
| British Pound | GBP | £ |
| Canadian Dollar | CAD | CA$ |
| Australian Dollar | AUD | A$ |
| Japanese Yen | JPY | ¥ |
| Chinese Yuan | CNY | ¥ |
| Indian Rupee | INR | ₹ |

---

## 🔒 Security Features

Quotla implements enterprise-grade security:

- **Row Level Security (RLS)**: Database-level isolation ensures users can only access their own data
- **Rate Limiting**: API endpoints are rate-limited to prevent abuse (5 requests/hour for sensitive operations)
- **Password Requirements**: Enforces strong passwords with minimum length, uppercase, lowercase, numbers, and special characters
- **File Upload Security**: Validates file types, sizes, and content to prevent malicious uploads
- **Input Sanitization**: All user inputs are sanitized to prevent XSS, SQL injection, and other attacks
- **JWT Authentication**: Secure token-based authentication with automatic refresh
- **Audit Logging**: Comprehensive logging of security events and admin actions
- **HTTPS Only**: All traffic encrypted in transit

---

## Project Structure

```text
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

## License

This project is proprietary software developed for Mission To Scale.

## Support

For issues or questions, please contact the development team.

---

Built with Next.js, Supabase, and Anthropic Claude
