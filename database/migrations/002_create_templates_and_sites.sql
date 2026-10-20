-- 2. Templates and Workspace Sites Module
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    thumbnail_url TEXT,
    is_premium BOOLEAN DEFAULT false
);

CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    domain VARCHAR(100) UNIQUE,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    is_home BOOLEAN DEFAULT false,
    "order" INT DEFAULT 0
);

CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    "order" INT DEFAULT 0
);