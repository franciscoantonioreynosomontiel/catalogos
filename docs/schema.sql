-- SQL Schema for Wisbe Platform (Supabase PostgreSQL)
-- Execute this SQL script in your Supabase SQL Editor

-- 1. Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    logo_url TEXT,
    brand_primary TEXT DEFAULT '#0f172a',
    brand_accent TEXT DEFAULT '#2563eb',
    business_type TEXT DEFAULT 'general', -- e.g. solar, hvac, paint, hardware, general
    owner_email TEXT
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    category TEXT DEFAULT 'General',
    description TEXT,
    image_url TEXT,
    stock INTEGER DEFAULT 10,
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active' -- active, archived
);

-- 3. Catalog Configs Table
CREATE TABLE IF NOT EXISTS public.catalog_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    layout_style TEXT DEFAULT 'grid', -- grid, list, masonry, compact
    columns INTEGER DEFAULT 3,
    card_border_radius TEXT DEFAULT '12px',
    show_prices BOOLEAN DEFAULT true,
    show_categories BOOLEAN DEFAULT true,
    show_search BOOLEAN DEFAULT true,
    enable_whatsapp_order BOOLEAN DEFAULT true,
    badge_text TEXT DEFAULT 'Disponible',
    primary_color TEXT DEFAULT '#0f172a',
    button_color TEXT DEFAULT '#2563eb'
);

-- 4. Landing Page Configs Table
CREATE TABLE IF NOT EXISTS public.landing_page_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_cta_text TEXT DEFAULT 'Contactar por WhatsApp',
    hero_image_url TEXT,
    badge_tag TEXT DEFAULT 'Soluciones Profesionales',
    features JSONB DEFAULT '[
        {"title": "Calidad Garantizada", "description": "Productos y servicios con altos estándares de calidad."},
        {"title": "Atención Personalizada", "description": "Asesoría experta adaptada a las necesidades de tu proyecto."},
        {"title": "Envíos y Respuesta Rápida", "description": "Atención e información inmediata vía WhatsApp."}
    ]'::jsonb,
    about_title TEXT DEFAULT 'Sobre Nosotros',
    about_description TEXT,
    show_featured_products BOOLEAN DEFAULT true,
    cta_banner_title TEXT DEFAULT '¿Listo para comenzar tu proyecto?',
    cta_banner_subtitle TEXT DEFAULT 'Ponte en contacto con nosotros hoy mismo y recibe atención inmediata.',
    theme_preset TEXT DEFAULT 'modern-dark'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_business_id ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_configs ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for reading data (Public Landing & Catalog Access)
CREATE POLICY "Public read businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read catalog_configs" ON public.catalog_configs FOR SELECT USING (true);
CREATE POLICY "Public read landing_page_configs" ON public.landing_page_configs FOR SELECT USING (true);

-- Permissive write policies (For client dashboard and admin management)
-- NOTE FOR SUPABASE AUTH INTEGRATION:
-- When replacing temporary login with Supabase Auth, update these policies to check `auth.uid() = business.owner_id` or admin role.
CREATE POLICY "Allow all modifications for demo/admin" ON public.businesses FOR ALL USING (true);
CREATE POLICY "Allow all modifications for products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all modifications for catalog_configs" ON public.catalog_configs FOR ALL USING (true);
CREATE POLICY "Allow all modifications for landing_page_configs" ON public.landing_page_configs FOR ALL USING (true);
