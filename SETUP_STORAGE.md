# Setup Supabase Storage for Trade Images

To enable photo uploads, you need to create a storage bucket in Supabase:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Storage** (left sidebar)
4. Click **"New bucket"**
5. Name it: `trade-images`
6. Make it **Public** (so images can be viewed without authentication)
7. Click **"Create bucket"**

## Storage Policies (Optional but Recommended)

For better security, you can set up Row Level Security policies:

1. Go to **Storage** → **Policies** → `trade-images`
2. Add a policy to allow authenticated users to upload:
   - Policy name: "Allow authenticated uploads"
   - Allowed operation: INSERT
   - Target roles: authenticated
   - Policy definition: `bucket_id = 'trade-images'`

3. Add a policy to allow public reads:
   - Policy name: "Allow public reads"
   - Allowed operation: SELECT
   - Target roles: anon, authenticated
   - Policy definition: `bucket_id = 'trade-images'`

After creating the bucket, photo uploads will work!

