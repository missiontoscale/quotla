# Quotla Blog Management

This directory contains blog post content and management tools for the Quotla blog.

## Directory Structure

```
blog/
├── posts/          # Markdown blog post files
├── images/         # Blog post images and media
└── README.md       # This file
```

## Blog System

Quotla uses a database-driven blog system powered by Supabase. Blog posts are stored in the `blog_posts` table and rendered dynamically.

### Database Schema

The blog uses the following tables:
- `blog_posts`: Stores blog post content, metadata, and publication status
- `blog_comments`: Stores user comments with moderation support

### Creating Blog Posts

#### Option 1: Direct Database Entry (Recommended for Production)

Use the Supabase admin panel or API to insert blog posts:

```sql
INSERT INTO blog_posts (title, slug, excerpt, content, published, published_at)
VALUES (
  'Your Post Title',
  'your-post-slug',
  'A brief excerpt of your post...',
  '<p>Your full HTML content here...</p>',
  true,
  NOW()
);
```

#### Option 2: Markdown Files (For Development)

You can write blog posts in Markdown format in the `posts/` directory. These files serve as drafts or can be converted to HTML and imported into the database.

**File Naming Convention:**
```
YYYY-MM-DD-post-slug.md
```

**Example:**
```
2024-01-15-getting-started-with-quotla.md
```

**Front Matter Format:**
```markdown
---
title: "Getting Started with Quotla"
slug: "getting-started-with-quotla"
excerpt: "Learn how to create professional quotes in minutes with Quotla's AI-powered platform."
author: "Quotla Team"
published: true
publishedAt: "2024-01-15"
tags: ["tutorial", "getting-started", "quotes"]
---

Your markdown content here...
```

### Converting Markdown to HTML

To convert markdown files to HTML for database insertion, use a markdown processor:

```bash
# Example using a Node.js script
node scripts/import-blog-posts.js
```

### Blog Post URLs

Blog posts are accessible at:
```
/blog/[slug]
```

Example: `/blog/getting-started-with-quotla`

### Comments System

The blog includes a built-in comments system with:
- User-submitted comments
- Admin moderation (comments require approval before displaying)
- Email notifications (optional)

### Managing Comments

Comments can be managed through:
1. Supabase admin panel
2. Custom admin dashboard (if implemented)
3. Direct SQL queries

### Best Practices

1. **SEO-Friendly Slugs**: Use lowercase, hyphen-separated slugs
2. **Excerpts**: Keep excerpts between 100-160 characters for SEO
3. **Images**: Store images in `blog/images/` and reference them in posts
4. **Tags**: Use consistent tags across posts for better organization
5. **Publishing**: Set `published: false` for drafts

### API Endpoints

- `GET /api/blog/posts` - List all published posts
- `GET /api/blog/posts/[slug]` - Get a single post
- `POST /api/blog/comment` - Submit a comment

### Future Enhancements

- [ ] Admin dashboard for blog management
- [ ] Markdown import tool
- [ ] Image upload and management
- [ ] RSS feed generation
- [ ] Social media sharing integration
- [ ] Related posts suggestions
