-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS "users" (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  user_name text,
  created_at timestamptz DEFAULT now(),
  bio text,
  rating numeric(3,1) DEFAULT 0
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON "users"(email);

-- Create index on user_name for faster searches
CREATE INDEX IF NOT EXISTS idx_users_user_name ON "users"(user_name);

