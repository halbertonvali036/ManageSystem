-- İlkin Planların Əlavə Olunması
INSERT INTO plans (name, is_premium, max_sites, ai_monthly_token_limit) 
VALUES 
('Free Plan', false, 1, 5000),
('Pro Plan', true, 5, 50000),
('Enterprise Plan', true, 20, 200000);