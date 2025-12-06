# Blog Management Guide

This guide explains how to manage the blog system in Quotla.

## Overview

Quotla includes a full-featured blog system with:
- Create, edit, and delete blog posts
- Publish/unpublish posts
- Comment moderation
- Public blog viewing
- SEO-friendly URLs (slugs)

## Accessing Blog Management

### For Admins

1. Log in to your account
2. Ensure you have admin privileges (see below)
3. Go to **Admin** → **Manage Blog Posts**

Or navigate directly to: `/admin/blog`

### Making a User an Admin

Run this SQL in your Supabase SQL Editor:

```sql
UPDATE profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with your actual email address.

## Creating a Blog Post

### Step 1: Access the Create Page

- Go to `/admin/blog`
- Click **"Create Post"**

### Step 2: Fill in Post Details

**Required Fields:**

1. **Title** - The headline of your blog post
   - Example: "Getting Started with Quotla"

2. **Slug** - The URL-friendly version
   - Auto-generated from title
   - Example: `getting-started-with-quotla`
   - URL will be: `/blog/getting-started-with-quotla`

3. **Content** - The main body of your post
   - HTML supported
   - Use basic HTML tags for formatting

**Optional Fields:**

4. **Excerpt** - A brief summary
   - Shows in blog list
   - Good for SEO

5. **Published** - Checkbox to publish immediately
   - Unchecked = Draft
   - Checked = Published

### Step 3: Format Your Content

You can use HTML in the content field. Here are common examples:

```html
<!-- Headings -->
<h2>Main Section Title</h2>
<h3>Subsection Title</h3>

<!-- Paragraphs -->
<p>This is a paragraph of text.</p>

<!-- Bold and Italic -->
<strong>Bold text</strong>
<em>Italic text</em>

<!-- Lists -->
<ul>
  <li>Bullet point 1</li>
  <li>Bullet point 2</li>
</ul>

<ol>
  <li>Numbered item 1</li>
  <li>Numbered item 2</li>
</ol>

<!-- Links -->
<a href="https://example.com">Link text</a>

<!-- Images -->
<img src="https://example.com/image.jpg" alt="Description" />

<!-- Line Breaks -->
<br />
```

### Step 4: Publish or Save as Draft

- **Save as Draft**: Uncheck "Published" - Only admins can see it
- **Publish**: Check "Published" - Visible to everyone at `/blog`

## Editing a Blog Post

1. Go to `/admin/blog`
2. Find your post in the list
3. Click **"Edit"**
4. Make your changes
5. Click **"Update Post"**

### Changing Publication Status

You can quickly publish/unpublish from the list view:
- Click **"Publish"** to make a draft public
- Click **"Unpublish"** to make a public post a draft

## Viewing Blog Posts

### As a Visitor

Public blog: `/blog`

Individual post: `/blog/your-post-slug`

### As an Admin

You can preview posts (including drafts) by clicking **"View"** in the admin panel.

## Comment Moderation

### How Comments Work

1. Visitors view blog posts at `/blog/post-slug`
2. They can leave comments with name and email
3. Comments are **NOT** visible until approved
4. Rate limit: 5 comments per hour per IP address

### Approving Comments

1. Go to `/admin` (main admin dashboard)
2. See "Pending Comments" section
3. Review each comment
4. Click **"Approve"** to make it public
5. Click **"Reject"** to delete it

### Comment Security

- All comments are sanitized to prevent XSS attacks
- HTML is stripped from comment content
- Rate limiting prevents spam
- Email addresses are validated

## Deleting Blog Posts

1. Go to `/admin/blog`
2. Find the post you want to delete
3. Click **"Delete"**
4. Confirm the deletion

**Warning**: Deleting a post also deletes all its comments. This cannot be undone.

## Sample Blog Posts

We've included sample blog posts in `sample-blog-posts.sql`. To use them:

1. Open Supabase SQL Editor
2. Copy and paste the contents of `sample-blog-posts.sql`
3. Run the SQL
4. Refresh your blog page

This will create 3 published posts and 1 draft post.

## Blog SEO Best Practices

### Slugs

- Keep them short and descriptive
- Use hyphens, not underscores
- Include keywords
- Make them readable

**Good**: `professional-invoice-tips`
**Bad**: `post_1234` or `this-is-a-very-long-slug-about-something`

### Excerpts

- Write 1-2 sentences
- Include main keywords
- Make it compelling
- Accurately summarize the post

### Titles

- Clear and descriptive
- Include keywords naturally
- Keep under 60 characters for search engines
- Make it clickable/interesting

## URL Structure

All blog posts follow this pattern:

```
https://yourdomain.com/blog/[slug]
```

Examples:
- `https://yourdomain.com/blog/getting-started`
- `https://yourdomain.com/blog/ai-descriptions`
- `https://yourdomain.com/blog/best-practices`

## Common Tasks

### Publishing Your First Post

1. Log in as admin
2. Go to `/admin/blog`
3. Click "Create Post"
4. Add title: "Welcome to Our Blog"
5. Slug auto-fills: "welcome-to-our-blog"
6. Add content using HTML
7. Check "Published"
8. Click "Create Post"
9. Visit `/blog` to see it live

### Updating an Existing Post

1. Go to `/admin/blog`
2. Find the post
3. Click "Edit"
4. Make changes
5. Click "Update Post"

### Scheduling Posts (Manual Method)

Since there's no built-in scheduling:

1. Create post as **Draft** (uncheck published)
2. When ready to publish:
   - Edit the post
   - Check "Published"
   - Save

### Managing Comments

**Daily routine:**
1. Check `/admin` dashboard
2. Review pending comments
3. Approve legitimate comments
4. Reject spam or inappropriate comments

## Troubleshooting

### "Access Denied" when accessing admin

Make sure your user is set as admin:

```sql
SELECT email, is_admin FROM profiles WHERE email = 'your@email.com';
```

If `is_admin` is `false`, update it:

```sql
UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
```

Then sign out and sign back in.

### Post not showing on blog

Check these:
1. Is "Published" checked?
2. Is `published_at` set? (Should auto-set when publishing)
3. Try refreshing the page
4. Check browser console for errors

### Comments not appearing

Remember:
- Comments require admin approval
- Only approved comments are visible
- Comments are tied to specific posts

### Slug already exists error

Each slug must be unique. If you get a duplicate slug error:
1. Change the slug to something unique
2. The slug is the URL, so it must be different from all other posts

## Advanced: Direct Database Access

If you need to make bulk changes, you can use SQL:

### Publish all drafts

```sql
UPDATE blog_posts
SET published = true, published_at = NOW()
WHERE published = false;
```

### Delete all unpublished posts

```sql
DELETE FROM blog_posts WHERE published = false;
```

### Find posts without excerpts

```sql
SELECT id, title FROM blog_posts WHERE excerpt IS NULL;
```

## Tips for Success

1. **Write regularly** - Consistency matters
2. **Use excerpts** - They improve list views and SEO
3. **Moderate comments quickly** - Engaged readers return
4. **Keep slugs permanent** - Changing slugs breaks links
5. **Preview before publishing** - Use the draft feature
6. **Use HTML formatting** - Makes posts more readable

## Next Steps

- Create your first blog post
- Add sample posts using `sample-blog-posts.sql`
- Set up a regular posting schedule
- Promote your blog on your homepage

For technical issues, refer to the main README.md or SETUP.md files.
