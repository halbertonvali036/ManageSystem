-- Test üçün Şablon yaradırıq
INSERT INTO templates (id, name, category, thumbnail_url, is_premium, is_published)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Portfolio Starter', 'Portfolio', 'https://via.placeholder.com/150', false, true);

-- Şablonun Ana Səhifəsi (Home Page)
INSERT INTO template_pages (id, template_id, title, slug, is_home, "order")
VALUES ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Home', 'home', true, 1);

-- Səhifənin daxilində Hero Bölməsi (Section)
INSERT INTO template_sections (template_page_id, section_type, content, "order")
VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
    'hero', 
    '{"title": "Xoş gəlmisiniz!", "subtitle": "Bu mənim portfolio saytımdır", "button_text": "Əlaqə"}'::jsonb, 
    1
);