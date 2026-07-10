-- Drop existing conflicting tables if needed
-- Create users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid primary key,
  email text unique not null,
  username text unique not null,
  full_name text not null,
  class_name text,
  role text default 'student',
  avatar_url text,
  created_at timestamptz default now()
);

-- Create library_posts
CREATE TABLE IF NOT EXISTS public.library_posts (
  id uuid primary key default gen_random_uuid(),
  book_title text not null,
  author_name text,
  rating integer default 0,
  review text not null,
  hashtags text[],
  avatar_url text,
  created_at timestamptz default now()
);

-- Create thoughts
CREATE TABLE IF NOT EXISTS public.thoughts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  thought text not null,
  author text,
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;

-- Allow public access since we bypass RLS with service_role in backend,
-- OR set up policies for public access if frontend uses them directly.
-- For simplicity, if frontend uses supabase directly, we allow all for demo:
CREATE POLICY "Public users access" ON public.users FOR ALL USING (true);
CREATE POLICY "Public library_posts access" ON public.library_posts FOR ALL USING (true);
CREATE POLICY "Public thoughts access" ON public.thoughts FOR ALL USING (true);
