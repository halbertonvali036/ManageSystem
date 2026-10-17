-- 1. Enum tipləri
CREATE TYPE ai_role_enum AS ENUM ('user', 'assistant', 'system');
CREATE TYPE proposal_status_enum AS ENUM ('pending', 'applied', 'rejected');

-- 2. AI Söhbətləri (Conversations)
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    title VARCHAR(150) DEFAULT 'Yeni Söhbət',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. AI Mesajları (Messages)
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role ai_role_enum NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. AI Təklifləri və Dəyişikliklər (Proposals/Actions)
CREATE TABLE ai_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
    target_section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    proposed_changes JSONB NOT NULL,
    status proposal_status_enum DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AI İstifadə Limitləri və Token Statistikası (Usage)
CREATE TABLE ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tokens_used INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PERFORMANS İNDEKS LƏRİ
CREATE INDEX idx_sites_user ON sites(user_id);
CREATE INDEX idx_pages_site ON pages(site_id);
CREATE INDEX idx_sections_page ON sections(page_id);
CREATE INDEX idx_templates_category ON templates(category, is_premium);
CREATE INDEX idx_ai_messages_conv ON ai_messages(conversation_id);
CREATE INDEX idx_ai_usage_user_date ON ai_usage(user_id, created_at);