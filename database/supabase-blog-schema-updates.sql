-- ================================================================
-- QUOTLA BLOG SYSTEM - DATABASE SCHEMA UPDATES
-- ================================================================
-- This file contains all database schema updates needed for:
-- - Admin role management
-- - Blog post likes/reactions
-- - Social sharing tracking
-- - Comments integration (Disqus)
-- ================================================================

-- 1. ADD ADMIN MANAGEMENT FIELDS
-- ================================================================
-- Add senior_admin field to profiles table for hierarchical admin management
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS senior_admin BOOLEAN DEFAULT FALSE;

-- Comment: senior_admin can remove other admins, regular admins can only write posts
COMMENT ON COLUMN profiles.senior_admin IS 'Senior admins have full control including removing other admins';

-- Update existing admin role comment
COMMENT ON COLUMN profiles.is_admin IS 'Regular admins can write and manage blog posts';


-- 2. BLOG POST LIKES/REACTIONS SYSTEM
-- ================================================================
CREATE TABLE IF NOT EXISTS blog_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Allow anonymous likes by storing session/IP when user_id is null
  session_id TEXT,
  ip_address INET,
  reaction_type VARCHAR(20) DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'insightful', 'helpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one reaction per user per post (or one per session if anonymous)
  UNIQUE(post_id, user_id),
  UNIQUE(post_id, session_id, ip_address)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_post_likes_post_id ON blog_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_likes_user_id ON blog_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_likes_created_at ON blog_post_likes(created_at DESC);

-- Add like_count to blog_posts for performance (denormalized)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Function to update like count
CREATE OR REPLACE FUNCTION update_blog_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_posts
    SET like_count = like_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE blog_posts
    SET like_count = like_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update like count
DROP TRIGGER IF EXISTS trigger_update_blog_post_like_count ON blog_post_likes;
CREATE TRIGGER trigger_update_blog_post_like_count
AFTER INSERT OR DELETE ON blog_post_likes
FOR EACH ROW
EXECUTE FUNCTION update_blog_post_like_count();


-- 3. SOCIAL SHARING TRACKING
-- ================================================================
CREATE TABLE IF NOT EXISTS blog_post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'twitter', 'linkedin', 'whatsapp', 'email', 'copy_link')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_blog_post_shares_post_id ON blog_post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_shares_platform ON blog_post_shares(platform);
CREATE INDEX IF NOT EXISTS idx_blog_post_shares_created_at ON blog_post_shares(created_at DESC);

-- Add share_count to blog_posts for performance
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Function to update share count
CREATE OR REPLACE FUNCTION update_blog_post_share_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_posts
    SET share_count = share_count + 1
    WHERE id = NEW.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update share count
DROP TRIGGER IF EXISTS trigger_update_blog_post_share_count ON blog_post_shares;
CREATE TRIGGER trigger_update_blog_post_share_count
AFTER INSERT ON blog_post_shares
FOR EACH ROW
EXECUTE FUNCTION update_blog_post_share_count();


-- 4. BLOG POST VIEW TRACKING
-- ================================================================
CREATE TABLE IF NOT EXISTS blog_post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_date DATE
);

-- Trigger to automatically set view_date from created_at
CREATE OR REPLACE FUNCTION set_blog_post_view_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.view_date := NEW.created_at::DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_blog_post_view_date ON blog_post_views;
CREATE TRIGGER trigger_set_blog_post_view_date
BEFORE INSERT ON blog_post_views
FOR EACH ROW
EXECUTE FUNCTION set_blog_post_view_date();

-- Create unique index to prevent duplicate view counting (one view per session per day)
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_post_views_unique_session_day
ON blog_post_views(post_id, session_id, view_date);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_blog_post_views_post_id ON blog_post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_views_created_at ON blog_post_views(created_at DESC);

-- Add view_count to blog_posts
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Function to update view count
CREATE OR REPLACE FUNCTION update_blog_post_view_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_posts
    SET view_count = view_count + 1
    WHERE id = NEW.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update view count
DROP TRIGGER IF EXISTS trigger_update_blog_post_view_count ON blog_post_views;
CREATE TRIGGER trigger_update_blog_post_view_count
AFTER INSERT ON blog_post_views
FOR EACH ROW
EXECUTE FUNCTION update_blog_post_view_count();


-- 5. DISQUS INTEGRATION SETTINGS
-- ================================================================
-- Store Disqus configuration
CREATE TABLE IF NOT EXISTS blog_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default Disqus settings (you'll need to update these with your actual values)
INSERT INTO blog_settings (setting_key, setting_value, description)
VALUES
  ('disqus_shortname', 'quotla-blog', 'Your Disqus shortname (change this in Disqus admin)'),
  ('disqus_enabled', 'true', 'Enable/disable Disqus comments'),
  ('facebook_app_id', '', 'Facebook App ID for sharing (optional)'),
  ('social_sharing_enabled', 'true', 'Enable/disable social sharing buttons')
ON CONFLICT (setting_key) DO NOTHING;


-- 6. ENHANCED BLOG POST METADATA
-- ================================================================
-- Add SEO and social media fields to blog_posts
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT[],
ADD COLUMN IF NOT EXISTS og_image_url TEXT,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add comment to explain og_image_url
COMMENT ON COLUMN blog_posts.og_image_url IS 'Open Graph image URL for social media previews';
COMMENT ON COLUMN blog_posts.featured IS 'Feature this post at the top of the blog';


-- 7. ADMIN ACTIVITY LOG
-- ================================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50), -- 'blog_post', 'user', 'admin', etc.
  target_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying admin actions
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON admin_activity_log(action);


-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on new tables
ALTER TABLE blog_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Blog post likes policies
CREATE POLICY "Anyone can view likes" ON blog_post_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create likes" ON blog_post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own likes" ON blog_post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Blog post shares policies (tracking only, no restrictions)
CREATE POLICY "Anyone can create share tracking" ON blog_post_shares
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view share stats" ON blog_post_shares
  FOR SELECT USING (true);

-- Blog post views policies (tracking only)
CREATE POLICY "Anyone can create view tracking" ON blog_post_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view stats" ON blog_post_views
  FOR SELECT USING (true);

-- Blog settings policies
CREATE POLICY "Anyone can view blog settings" ON blog_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can update blog settings" ON blog_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin activity log policies
CREATE POLICY "Admins can view admin activity log" ON admin_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can create activity logs" ON admin_activity_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );


-- 9. HELPER FUNCTIONS FOR BLOG ANALYTICS
-- ================================================================

-- Function to get post statistics
CREATE OR REPLACE FUNCTION get_blog_post_stats(post_uuid UUID)
RETURNS TABLE (
  total_views BIGINT,
  total_likes BIGINT,
  total_shares BIGINT,
  reaction_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM blog_post_views WHERE post_id = post_uuid),
    (SELECT COUNT(*) FROM blog_post_likes WHERE post_id = post_uuid),
    (SELECT COUNT(*) FROM blog_post_shares WHERE post_id = post_uuid),
    (SELECT jsonb_object_agg(reaction_type, count)
     FROM (
       SELECT reaction_type, COUNT(*) as count
       FROM blog_post_likes
       WHERE post_id = post_uuid
       GROUP BY reaction_type
     ) reactions
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get trending posts
CREATE OR REPLACE FUNCTION get_trending_blog_posts(days_back INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  post_id UUID,
  title TEXT,
  slug TEXT,
  views BIGINT,
  likes BIGINT,
  shares BIGINT,
  trend_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bp.id,
    bp.title,
    bp.slug,
    COUNT(DISTINCT bpv.id) as views,
    COUNT(DISTINCT bpl.id) as likes,
    COUNT(DISTINCT bps.id) as shares,
    -- Trend score: weighted combination of engagement metrics
    (COUNT(DISTINCT bpv.id) * 1.0 +
     COUNT(DISTINCT bpl.id) * 5.0 +
     COUNT(DISTINCT bps.id) * 3.0) as trend_score
  FROM blog_posts bp
  LEFT JOIN blog_post_views bpv ON bp.id = bpv.post_id
    AND bpv.created_at >= NOW() - (days_back || ' days')::INTERVAL
  LEFT JOIN blog_post_likes bpl ON bp.id = bpl.post_id
    AND bpl.created_at >= NOW() - (days_back || ' days')::INTERVAL
  LEFT JOIN blog_post_shares bps ON bp.id = bps.post_id
    AND bps.created_at >= NOW() - (days_back || ' days')::INTERVAL
  WHERE bp.published = true
  GROUP BY bp.id, bp.title, bp.slug
  ORDER BY trend_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;


-- 10. UPDATE EXISTING BLOG_POSTS TABLE RLS POLICIES
-- ================================================================

-- Drop existing policies if they're too restrictive
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;

-- Recreate with proper permissions
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (published = true OR auth.uid() = author_id);

CREATE POLICY "Admins can create blog posts" ON blog_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update their own posts" ON blog_posts
  FOR UPDATE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.senior_admin = true
    )
  );

CREATE POLICY "Senior admins can delete any post" ON blog_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.senior_admin = true
    )
  );

CREATE POLICY "Admins can delete their own posts" ON blog_posts
  FOR DELETE USING (auth.uid() = author_id);


-- ================================================================
-- INSTRUCTIONS FOR USE
-- ================================================================
-- 1. Run this entire file in your Supabase SQL editor
-- 2. After running, you'll have:
--    - Admin hierarchy (senior_admin field)
--    - Like/reaction system
--    - Social sharing tracking
--    - View counting
--    - Disqus settings table
--    - Enhanced SEO fields
--    - Analytics functions
--
-- 3. Next steps:
--    a. Set your first senior admin:
--       UPDATE profiles SET senior_admin = true WHERE email = 'chibuzordev@gmail.com';
--
--    b. Update Disqus shortname:
--       UPDATE blog_settings SET setting_value = 'your-disqus-shortname'
--       WHERE setting_key = 'disqus_shortname';
--
--    c. Insert the blog posts using the corrected blog-posts-tax-law-corrected.sql file
-- ================================================================
