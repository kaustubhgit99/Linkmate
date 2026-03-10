-- =============================================
-- LINKMATE — Supabase Database Setup
-- Paste this into Supabase SQL Editor and Run
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---- TABLES ----

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen','owner','admin')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rent_price NUMERIC NOT NULL DEFAULT 0 CHECK (rent_price >= 0),
  location TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  room_type TEXT NOT NULL DEFAULT 'Single Room',
  amenities TEXT[] DEFAULT '{}',
  num_beds INTEGER NOT NULL DEFAULT 1,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.room_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, room_id)
);

-- ---- INDEXES ----
CREATE INDEX IF NOT EXISTS idx_rooms_owner ON public.rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_rooms_city ON public.rooms(city);
CREATE INDEX IF NOT EXISTS idx_rooms_avail ON public.rooms(is_available);
CREATE INDEX IF NOT EXISTS idx_room_images_room ON public.room_images(room_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);

-- ---- AUTO-UPDATE TRIGGER ----
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS rooms_updated_at ON public.rooms;
CREATE TRIGGER rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---- AUTO-CREATE USER PROFILE ON SIGNUP ----
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---- ROW LEVEL SECURITY ----
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_update" ON public.users;
DROP POLICY IF EXISTS "users_insert" ON public.users;
DROP POLICY IF EXISTS "rooms_select" ON public.rooms;
DROP POLICY IF EXISTS "rooms_insert" ON public.rooms;
DROP POLICY IF EXISTS "rooms_update" ON public.rooms;
DROP POLICY IF EXISTS "rooms_delete" ON public.rooms;
DROP POLICY IF EXISTS "images_select" ON public.room_images;
DROP POLICY IF EXISTS "images_all" ON public.room_images;
DROP POLICY IF EXISTS "favs_select" ON public.favorites;
DROP POLICY IF EXISTS "favs_insert" ON public.favorites;
DROP POLICY IF EXISTS "favs_delete" ON public.favorites;

-- Users
CREATE POLICY "users_select" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Rooms (anyone can read, owners manage their own, admins manage all)
CREATE POLICY "rooms_select" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "rooms_insert" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "rooms_update" ON public.rooms FOR UPDATE USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.users WHERE id=auth.uid() AND role='admin'));
CREATE POLICY "rooms_delete" ON public.rooms FOR DELETE USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.users WHERE id=auth.uid() AND role='admin'));

-- Room images
CREATE POLICY "images_select" ON public.room_images FOR SELECT USING (true);
CREATE POLICY "images_all" ON public.room_images FOR ALL USING (EXISTS (SELECT 1 FROM public.rooms WHERE id=room_id AND owner_id=auth.uid()));

-- Favorites
CREATE POLICY "favs_select" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favs_insert" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favs_delete" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- ---- STORAGE BUCKET ----
INSERT INTO storage.buckets (id, name, public) VALUES ('room-images','room-images',true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "storage_select" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete" ON storage.objects;

CREATE POLICY "storage_select" ON storage.objects FOR SELECT USING (bucket_id='room-images');
CREATE POLICY "storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id='room-images' AND auth.role()='authenticated');
CREATE POLICY "storage_delete" ON storage.objects FOR DELETE USING (bucket_id='room-images' AND auth.role()='authenticated');

-- ---- DONE ----
-- To make yourself admin, run after signing up:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
