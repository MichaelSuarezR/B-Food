# Database Schema Changes Required

This document lists the database columns/tables that need to be added to support the new API features.

## Required Database Changes

### 1. Trades Table
Add these columns:
```sql
ALTER TABLE "Trades" 
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS image_urls text[];
```

### 2. Users Table
Add these columns:
```sql
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS rating numeric(3,1) DEFAULT 0;
```

### 3. Messages Table
Add this column:
```sql
ALTER TABLE "Messages"
  ADD COLUMN IF NOT EXISTS attachment_url text;
```

### 4. LookingFor Table (NEW)
Create new table:
```sql
CREATE TABLE IF NOT EXISTS "LookingFor" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES "users"(id),
  item_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_looking_for_user_id ON "LookingFor"(user_id);
```

### 5. Ratings Table (NEW)
Create new table:
```sql
CREATE TABLE IF NOT EXISTS "Ratings" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id uuid NOT NULL REFERENCES "users"(id),
  rated_user_id uuid NOT NULL REFERENCES "users"(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(rater_id, rated_user_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_rated_user_id ON "Ratings"(rated_user_id);
```

### 6. Offers Table (NEW)
Create new table:
```sql
CREATE TABLE IF NOT EXISTS "Offers" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id uuid NOT NULL REFERENCES "Trades"(id),
  offerer_user_id uuid NOT NULL REFERENCES "users"(id),
  message text,
  price numeric,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offers_trade_id ON "Offers"(trade_id);
CREATE INDEX IF NOT EXISTS idx_offers_offerer_user_id ON "Offers"(offerer_user_id);
```

## Summary

**New Tables:**
- `LookingFor` - User's "looking for" items
- `Ratings` - User ratings system
- `Offers` - Trade offers ("Make an offer" functionality)

**New Columns:**
- `Trades.tags` - Array of tags for trade listings
- `Trades.image_urls` - Array of image URLs for trade listings
- `users.bio` - User bio/description
- `users.rating` - Average user rating (0-5)
- `Messages.attachment_url` - Attachment URL for messages

