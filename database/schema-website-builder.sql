-- =====================================================================
-- ManageSystem - website builder schema (PostgreSQL)
-- Run AFTER schema.sql (it references the users table).
-- Sources: docs/phase-9-publishing.md, docs/phase-10-forms.md,
--          docs/phase12-motion.md, README.md
--
-- Design note: the editor works on ONE normalized JSON document per site
-- (sections, blocks, form definitions, motion preset, theme tokens).
-- The frontend normalizes and duplicates this document itself, so the
-- backend stores it as JSONB instead of splitting it into many tables.
-- Draft: DRAFT PROPOSAL - confirm with the backend developer.
-- =====================================================================

BEGIN;

CREATE TYPE publication_status AS ENUM ('UNPUBLISHED', 'PUBLISHED');
CREATE TYPE domain_kind        AS ENUM ('SUBDOMAIN', 'CUSTOM');
CREATE TYPE domain_status      AS ENUM ('UNCONFIGURED', 'PENDING', 'CONNECTED', 'ERROR');
CREATE TYPE ssl_status         AS ENUM ('UNCONFIGURED', 'PENDING', 'ACTIVE', 'ERROR');
CREATE TYPE dns_record_type    AS ENUM ('A', 'CNAME', 'TXT');

-- ---------- Templates (used by the template wizard) ----------
CREATE TABLE site_templates (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key         VARCHAR(60)  NOT NULL UNIQUE,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  document    JSONB NOT NULL,                      -- starting editor document
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Websites ----------
CREATE TABLE websites (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id        BIGINT REFERENCES site_templates(id) ON DELETE SET NULL,
  name               VARCHAR(150) NOT NULL,
  slug               VARCHAR(63)  NOT NULL,         -- subdomain suggestion source
  homepage_key       VARCHAR(100),                  -- id of the selected homepage inside the document
  publication_status publication_status NOT NULL DEFAULT 'UNPUBLISHED',
  published_url      VARCHAR(500),                  -- null until published
  published_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (slug = lower(slug)),
  CHECK (publication_status = 'PUBLISHED' OR published_url IS NULL)
);
CREATE UNIQUE INDEX websites_slug_unique ON websites (slug);

-- ---------- Editor draft (one current draft per website) ----------
CREATE TABLE site_drafts (
  website_id BIGINT PRIMARY KEY REFERENCES websites(id) ON DELETE CASCADE,
  document   JSONB NOT NULL,                       -- sections, blocks, forms, motion, theme
  version    INTEGER NOT NULL DEFAULT 1,           -- bump on every save (conflict detection)
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Publications (snapshot of what went live) ----------
CREATE TABLE site_publications (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  website_id     BIGINT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  snapshot       JSONB NOT NULL,                   -- document as published
  published_by   BIGINT REFERENCES users(id) ON DELETE SET NULL,
  published_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  unpublished_at TIMESTAMPTZ                       -- set on unpublish
);

-- ---------- Media ----------
CREATE TABLE site_media (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  website_id   BIGINT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  uploaded_by  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  file_name    VARCHAR(255) NOT NULL,
  mime_type    VARCHAR(100) NOT NULL,
  size_bytes   BIGINT NOT NULL CHECK (size_bytes >= 0),
  width        INTEGER,
  height       INTEGER,
  storage_key  VARCHAR(500) NOT NULL UNIQUE,       -- location in file storage
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Domains and DNS ----------
-- Custom-domain flow: add domain -> DNS records -> verify -> connected
CREATE TABLE site_domains (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  website_id  BIGINT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  hostname    VARCHAR(253) NOT NULL,
  kind        domain_kind   NOT NULL DEFAULT 'CUSTOM',
  status      domain_status NOT NULL DEFAULT 'UNCONFIGURED',
  ssl_status  ssl_status    NOT NULL DEFAULT 'UNCONFIGURED',
  verified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (hostname = lower(hostname))
);
CREATE UNIQUE INDEX site_domains_hostname_unique ON site_domains (hostname);

-- Records the user must create at their DNS provider (supplied by backend)
CREATE TABLE domain_dns_records (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  domain_id   BIGINT NOT NULL REFERENCES site_domains(id) ON DELETE CASCADE,
  record_type dns_record_type NOT NULL,
  name        VARCHAR(253) NOT NULL,
  value       VARCHAR(500) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Contact forms ----------
-- Form DEFINITIONS (fields, labels, types, required flags) live inside
-- site_drafts.document. form_id below is the stable form id from that document.
CREATE TABLE form_submissions (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  website_id   BIGINT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  form_id      VARCHAR(100) NOT NULL,
  payload      JSONB NOT NULL,                     -- answers keyed by field machine key
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Future form configuration (redirect, notification email) - currently
-- shown as "integration pending" in the frontend.
CREATE TABLE site_form_settings (
  website_id         BIGINT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  form_id            VARCHAR(100) NOT NULL,
  redirect_url       VARCHAR(500),
  notification_email VARCHAR(255),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (website_id, form_id)
);

-- ---------- Indexes ----------
CREATE INDEX idx_websites_owner         ON websites(owner_id);
CREATE INDEX idx_publications_website   ON site_publications(website_id, published_at DESC);
CREATE INDEX idx_media_website          ON site_media(website_id);
CREATE INDEX idx_domains_website        ON site_domains(website_id);
CREATE INDEX idx_dns_records_domain     ON domain_dns_records(domain_id);
CREATE INDEX idx_submissions_form       ON form_submissions(website_id, form_id, submitted_at DESC);

-- ---------- updated_at triggers (uses set_updated_at from schema.sql) ----------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['site_templates','websites','site_domains','site_form_settings']
  LOOP
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I
                    FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t || '_updated_at', t);
  END LOOP;
END $$;

COMMIT;