

# Supabase Database Setup

For the application to function correctly with Supabase sync, your database needs to have the correct tables and security policies. Run the following SQL queries in your project's **SQL Editor** in the Supabase Dashboard.

If you are starting a new project, you should run the `CREATE TABLE` scripts. If you have an existing project with a missing column, run the `ALTER TABLE` script in the "Fix" section.

## 1. Main Collection Table

This table stores the main collection, including both CDs and Vinyls, distinguished by the `media_type` column. The table is named `cds` for backward compatibility.

```sql
-- Create the main table for the collection
CREATE TABLE public.cds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  artist text NOT NULL,
  title text NOT NULL,
  media_type text NOT NULL DEFAULT 'cd',
  genre text NULL,
  year integer NULL,
  coverArtUrl text NULL,
  notes text NULL,
  version text NULL,
  recordLabel text NULL,
  tags text[] NULL,
  tracklist jsonb NULL,
  CONSTRAINT cds_pkey PRIMARY KEY (id),
  CONSTRAINT cds_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add comments for clarity
COMMENT ON TABLE public.cds IS 'Stores the user''s collection of music (CDs, Vinyls, etc).';

-- 1. Enable Row Level Security (RLS) on the table
ALTER TABLE public.cds ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy that allows users to view their own items
CREATE POLICY "Enable read access for own items" ON public.cds
FOR SELECT USING (auth.uid() = user_id);

-- 3. Create a policy that allows users to add their own items
CREATE POLICY "Enable insert for own items" ON public.cds
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Create a policy that allows users to update their own items
CREATE POLICY "Enable update for own items" ON public.cds
FOR UPDATE USING (auth.uid() = user_id);

-- 5. Create a policy that allows users to delete their own items
CREATE POLICY "Enable delete for own items" ON public.cds
FOR DELETE USING (auth.uid() = user_id);
```

## 2. Wantlist Table

This table stores albums the user wants to acquire.

```sql
-- Create the table for the user's wantlist
CREATE TABLE public.wantlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  artist text NOT NULL,
  title text NOT NULL,
  media_type text NOT NULL DEFAULT 'cd',
  genre text NULL,
  year integer NULL,
  coverArtUrl text NULL,
  notes text NULL,
  version text NULL,
  recordLabel text NULL,
  tags text[] NULL,
  tracklist jsonb NULL,
  CONSTRAINT wantlist_pkey PRIMARY KEY (id),
  CONSTRAINT wantlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add comments for clarity
COMMENT ON TABLE public.wantlist IS 'Stores items users want to add to their collection.';

-- 1. Enable Row Level Security (RLS) on the table
ALTER TABLE public.wantlist ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy that allows users to view their own wantlist items
CREATE POLICY "Enable read access for own wantlist items" ON public.wantlist
FOR SELECT USING (auth.uid() = user_id);

-- 3. Create a policy that allows users to add their own wantlist items
CREATE POLICY "Enable insert for own wantlist items" ON public.wantlist
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Create a policy that allows users to update their own wantlist items
CREATE POLICY "Enable update for own wantlist items" ON public.wantlist
FOR UPDATE USING (auth.uid() = user_id);

-- 5. Create a policy that allows users to delete their own wantlist items
CREATE POLICY "Enable delete for own wantlist items" ON public.wantlist
FOR DELETE USING (auth.uid() = user_id);
```

## 3. Fixes for Existing Tables (FIX)

If you created your tables with older versions of the setup scripts, they might be missing some columns. The following scripts will add the missing columns without deleting any of your data.

### Fix for Missing `media_type` Column (IMPORTANT FOR VINYL UPDATE)
Run these commands to add the `media_type` column to your existing tables. This is required to support both CDs and Vinyls.

```sql
-- Adds the media_type column to the main collection table.
ALTER TABLE public.cds
ADD COLUMN IF NOT EXISTS "media_type" text NOT NULL DEFAULT 'cd';

-- Adds the media_type column to the wantlist table.
ALTER TABLE public.wantlist
ADD COLUMN IF NOT EXISTS "media_type" text NOT NULL DEFAULT 'cd';
```

### Fix for Missing `tracklist` Column
If you are getting errors about `tracklist`, run these commands:

```sql
-- Adds the tracklist column to the cds table if it doesn't exist.
ALTER TABLE public.cds
ADD COLUMN IF NOT EXISTS "tracklist" jsonb NULL;

-- Adds the tracklist column to the wantlist table if it doesn't exist.
ALTER TABLE public.wantlist
ADD COLUMN IF NOT EXISTS "tracklist" jsonb NULL;
```