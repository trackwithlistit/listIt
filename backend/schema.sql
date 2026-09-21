-- ListIt PostgreSQL Schema for Supabase

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    banner_url TEXT,
    bio TEXT DEFAULT '',
    role VARCHAR(50) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT false,
    favorite_genres JSONB DEFAULT '[]'::jsonb,
    favorite_character TEXT,
    favorite_studio TEXT,
    followers JSONB DEFAULT '[]'::jsonb,
    following JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    badges JSONB DEFAULT '["early_adopter"]'::jsonb,
    watch_streak INT DEFAULT 0,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{"theme": "dark", "is_profile_public": true}'::jsonb,
    refresh_tokens JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ANIME & SERIES LIST ENTRIES TABLE
CREATE TABLE IF NOT EXISTS anime_list_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    anilist_id INT NOT NULL,
    title TEXT NOT NULL,
    media_type VARCHAR(50) DEFAULT 'anime',
    status VARCHAR(50) DEFAULT 'planning',
    score NUMERIC DEFAULT 0,
    progress INT DEFAULT 0,
    rewatch_count INT DEFAULT 0,
    notes TEXT DEFAULT '',
    is_favorite BOOLEAN DEFAULT false,
    is_private BOOLEAN DEFAULT false,
    priority VARCHAR(50) DEFAULT 'medium',
    tags JSONB DEFAULT '[]'::jsonb,
    genres JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, anilist_id, media_type)
);

-- 3. ACTIVITY LOG TABLE
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    media_type VARCHAR(50) DEFAULT 'anime',
    media_id INT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    media_id INT NOT NULL,
    media_type VARCHAR(50) DEFAULT 'anime',
    content TEXT NOT NULL,
    score NUMERIC DEFAULT 0,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. IMAGE SAFETY CACHE TABLE
CREATE TABLE IF NOT EXISTS image_safety_cache (
    id SERIAL PRIMARY KEY,
    image_url TEXT UNIQUE NOT NULL,
    safety VARCHAR(50) NOT NULL,
    nudity_spots JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on public tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime_list_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_safety_cache ENABLE ROW LEVEL SECURITY;

-- Allow public CRUD access policies
CREATE POLICY "Public Read Users" ON users FOR SELECT USING (true);
CREATE POLICY "Public Insert Users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Users" ON users FOR UPDATE USING (true);

CREATE POLICY "Public Read Entries" ON anime_list_entries FOR SELECT USING (true);
CREATE POLICY "Public Insert Entries" ON anime_list_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Entries" ON anime_list_entries FOR UPDATE USING (true);
CREATE POLICY "Public Delete Entries" ON anime_list_entries FOR DELETE USING (true);

CREATE POLICY "Public Read Activity" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Public Insert Activity" ON activity_log FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public Insert Reviews" ON reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Safety All" ON image_safety_cache FOR ALL USING (true);
