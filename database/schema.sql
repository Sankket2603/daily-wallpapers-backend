-- ==========================================================
-- DAILY WALLPAPERS - DATABASE SCHEMA (PostgreSQL / Supabase)
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. WALLPAPERS TABLE
CREATE TABLE IF NOT EXISTS wallpapers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    original_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    medium_url TEXT NOT NULL,
    full_url TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size BIGINT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    is_daily BOOLEAN DEFAULT FALSE NOT NULL,
    publish_date DATE DEFAULT CURRENT_DATE NOT NULL,
    downloads INTEGER DEFAULT 0 NOT NULL,
    views INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. DAILY WALLPAPERS TABLE (Wallpaper of the Day)
CREATE TABLE IF NOT EXISTS daily_wallpapers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallpaper_id UUID NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
    display_date DATE NOT NULL,
    position INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_date_position UNIQUE (display_date, position)
);

-- 4. FAVORITES TABLE (Supports Supabase Auth users and guest device IDs)
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id VARCHAR(128),
    wallpaper_id UUID NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. DOWNLOADS TABLE
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    wallpaper_id UUID NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
    device_id VARCHAR(128) NOT NULL,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_wallpapers_category ON wallpapers(category_id);
CREATE INDEX IF NOT EXISTS idx_wallpapers_daily ON wallpapers(is_daily, publish_date);
CREATE INDEX IF NOT EXISTS idx_wallpapers_featured ON wallpapers(is_featured);
CREATE INDEX IF NOT EXISTS idx_wallpapers_created_at ON wallpapers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_wallpapers_date ON daily_wallpapers(display_date);
CREATE INDEX IF NOT EXISTS idx_downloads_wallpaper_id ON downloads(wallpaper_id);
CREATE INDEX IF NOT EXISTS idx_favorites_device_id ON favorites(device_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_wallpapers ENABLE ROW LEVEL SECURITY;

-- Public read access for mobile clients
CREATE POLICY "Public categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Public wallpapers are viewable by everyone" ON wallpapers FOR SELECT USING (true);
CREATE POLICY "Public daily wallpapers viewable by everyone" ON daily_wallpapers FOR SELECT USING (true);
CREATE POLICY "Users can view and add own favorites" ON favorites FOR ALL USING (true);
CREATE POLICY "Users can view and record downloads" ON downloads FOR ALL USING (true);

-- Admin write policies (enforced via Supabase Auth Role / Service Role)
CREATE POLICY "Admins can modify wallpapers" ON wallpapers FOR ALL TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can modify categories" ON categories FOR ALL TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can modify daily wallpapers" ON daily_wallpapers FOR ALL TO authenticated USING (auth.role() = 'authenticated');

-- ==========================================================
-- SEED DATA
-- ==========================================================
INSERT INTO categories (id, name, slug, image_url) VALUES
('c1111111-1111-1111-1111-111111111111', 'Nature', 'nature', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80'),
('c2222222-2222-2222-2222-222222222222', 'Minimal', 'minimal', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'),
('c3333333-3333-3333-3333-333333333333', 'Abstract', 'abstract', 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80'),
('c4444444-4444-4444-4444-444444444444', 'Dark & AMOLED', 'dark', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'),
('c5555555-5555-5555-5555-555555555555', 'Space', 'space', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'),
('c6666666-6666-6666-6666-666666666666', 'Architecture', 'architecture', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'),
('c7777777-7777-7777-7777-777777777777', 'Cars', 'cars', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80'),
('c8888888-8888-8888-8888-888888888888', 'Gaming', 'gaming', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80')
ON CONFLICT (name) DO NOTHING;
