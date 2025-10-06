/*
  # Update profile and watchlist tables to use text IDs

  1. Changes
    - Convert profile.id from UUID to text to match Firebase auth IDs
    - Update watchlist.user_id to text to match new profile.id type
    - Preserve all existing data
    - Maintain all constraints and policies
    
  2. Security
    - Temporarily disable RLS during migration
    - Restore all RLS policies after migration
    - Maintain all existing security features
*/

-- Temporarily disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist DISABLE ROW LEVEL SECURITY;

-- Drop the foreign key constraint
ALTER TABLE watchlist DROP CONSTRAINT IF EXISTS watchlist_user_id_fkey;

-- Create new tables with correct column types
CREATE TABLE new_profiles (
  id text PRIMARY KEY,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE new_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  media_id integer NOT NULL,
  media_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Copy data from old tables to new tables with explicit type casting
INSERT INTO new_profiles 
SELECT 
  id::text,
  username,
  full_name,
  avatar_url,
  preferences,
  created_at,
  updated_at
FROM profiles;

INSERT INTO new_watchlist
SELECT
  id,
  user_id::text,
  media_id,
  media_type,
  created_at
FROM watchlist;

-- Drop old tables
DROP TABLE IF EXISTS watchlist CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Rename new tables
ALTER TABLE new_profiles RENAME TO profiles;
ALTER TABLE new_watchlist RENAME TO watchlist;

-- Add constraints to watchlist
ALTER TABLE watchlist
ADD CONSTRAINT watchlist_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id);

ALTER TABLE watchlist
ADD CONSTRAINT watchlist_media_type_check
CHECK (media_type = ANY (ARRAY['movie'::text, 'tv'::text]));

ALTER TABLE watchlist
ADD CONSTRAINT watchlist_user_id_media_id_media_type_key
UNIQUE (user_id, media_id, media_type);

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for profiles
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid()::text = id);

-- Recreate RLS policies for watchlist
CREATE POLICY "Users can add to watchlist"
ON watchlist
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can read own watchlist"
ON watchlist
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can remove from watchlist"
ON watchlist
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Recreate the updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();