-- Add onboarding_completed field to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing users to have onboarding_completed = true
-- (assuming existing users have already completed onboarding informally)
UPDATE profiles
SET onboarding_completed = TRUE
WHERE company_name IS NOT NULL AND company_name != '';

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed
ON profiles(onboarding_completed);

-- Add a comment to document the field
COMMENT ON COLUMN profiles.onboarding_completed IS 'Indicates whether the user has completed the onboarding flow';
