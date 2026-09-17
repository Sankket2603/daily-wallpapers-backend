import React, { useState } from 'react';
import { Database, Server, Copy, Check, ShieldCheck, Key } from 'lucide-react';

export const DatabaseDocsViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlSchema = `-- ==========================================================
-- DAILY WALLPAPERS - POSTGRESQL / SUPABASE DDL
-- ==========================================================

-- Enable extensions
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

-- 3. DAILY WALLPAPERS TABLE (Wallpaper of the Day scheduling)
CREATE TABLE IF NOT EXISTS daily_wallpapers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallpaper_id UUID NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
    display_date DATE NOT NULL,
    position INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_date_position UNIQUE (display_date, position)
);

-- 4. FAVORITES TABLE (Supports both Supabase Auth users and guest device IDs)
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id VARCHAR(128),
    wallpaper_id UUID NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. DOWNLOADS TABLE (Tracking & Analytics)
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    wallpaper_id UUID NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
    device_id VARCHAR(128) NOT NULL,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_wallpapers_category ON wallpapers(category_id);
CREATE INDEX IF NOT EXISTS idx_wallpapers_daily ON wallpapers(is_daily, publish_date);
CREATE INDEX IF NOT EXISTS idx_wallpapers_featured ON wallpapers(is_featured);
CREATE INDEX IF NOT EXISTS idx_wallpapers_created_at ON wallpapers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_wallpapers_date ON daily_wallpapers(display_date);
CREATE INDEX IF NOT EXISTS idx_downloads_wallpaper_id ON downloads(wallpaper_id);
CREATE INDEX IF NOT EXISTS idx_favorites_device_id ON favorites(device_id);

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_wallpapers ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Public wallpapers are viewable by everyone" ON wallpapers FOR SELECT USING (true);
CREATE POLICY "Public daily wallpapers viewable by everyone" ON daily_wallpapers FOR SELECT USING (true);
CREATE POLICY "Anyone can view and add favorites" ON favorites FOR ALL USING (true);
CREATE POLICY "Anyone can record downloads" ON downloads FOR ALL USING (true);

-- 8. INITIAL PRELOADED CATEGORIES
INSERT INTO categories (id, name, slug, image_url) VALUES
('c1111111-1111-1111-1111-111111111111', 'Nature', 'nature', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80'),
('c2222222-2222-2222-2222-222222222222', 'Minimal', 'minimal', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'),
('c3333333-3333-3333-3333-333333333333', 'Abstract', 'abstract', 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80'),
('c4444444-4444-4444-4444-444444444444', 'Dark & AMOLED', 'dark', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'),
('c5555555-5555-5555-5555-555555555555', 'Space', 'space', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'),
('c6666666-6666-6666-6666-666666666666', 'Architecture', 'architecture', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'),
('c7777777-7777-7777-7777-777777777777', 'Cars', 'cars', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80'),
('c8888888-8888-8888-8888-888888888888', 'Gaming', 'gaming', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80')
ON CONFLICT (name) DO NOTHING;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endpoints = [
    { method: 'GET', path: '/api/wallpapers', desc: 'Fetch wallpapers with optional ?category= and pagination' },
    { method: 'GET', path: '/api/wallpapers/daily', desc: "Fetch today's prioritized daily wallpapers" },
    { method: 'GET', path: '/api/wallpapers/featured', desc: 'Fetch curated featured collection' },
    { method: 'GET', path: '/api/wallpapers/:id', desc: 'Fetch single wallpaper details' },
    { method: 'GET', path: '/api/categories', desc: 'Fetch all categories with wallpaper counts' },
    { method: 'GET', path: '/api/search?q=', desc: 'Search wallpapers by query string' },
    { method: 'POST', path: '/api/wallpapers/:id/view', desc: 'Increment view counter' },
    { method: 'POST', path: '/api/wallpapers/:id/download', desc: 'Register download record and increment counter' },
    { method: 'GET/POST', path: '/api/favorites', desc: 'Fetch and toggle favorite status' },
    { method: 'POST', path: '/api/admin/wallpapers', desc: 'Ingest wallpaper with multi-resolution CDN links' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[#6C63FF]" />
          <h2 className="text-xl font-bold text-[#171717]">
            Backend & Database Architecture
          </h2>
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          PostgreSQL / Supabase Schema, Row Level Security, and REST APIs
        </p>
      </div>

      {/* SQL Schema Box */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-neutral-50 border-b border-neutral-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
            <Server className="w-4 h-4 text-neutral-500" />
            Supabase PostgreSQL DDL (schema.sql)
          </div>
          <button
            onClick={handleCopySql}
            className="px-3 py-1 rounded-lg bg-white border border-neutral-200 text-neutral-700 text-xs font-medium flex items-center gap-1.5 hover:bg-neutral-50 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy SQL
              </>
            )}
          </button>
        </div>

        <div className="p-4 bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto max-h-[350px]">
          <pre className="leading-relaxed">
            <code>{sqlSchema}</code>
          </pre>
        </div>
      </div>

      {/* API Endpoints Catalog */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#171717] flex items-center gap-1.5">
          <Key className="w-4 h-4 text-[#6C63FF]" />
          Active REST API Endpoints (Express & Supabase compatible)
        </h3>

        <div className="divide-y divide-neutral-100">
          {endpoints.map((ep, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    ep.method === 'GET'
                      ? 'bg-blue-50 text-blue-700'
                      : ep.method === 'POST'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-purple-50 text-purple-700'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-neutral-800 font-semibold">{ep.path}</span>
              </div>
              <span className="text-neutral-500 text-right">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
