# Database Architecture (SiteBuilder)

This folder contains the PostgreSQL database schema, migrations, seed data, and entity-relationship diagrams for the SiteBuilder platform.

## Directory Structure

| Path | Description |
|---|---|
| `schema.sql` | Consolidated Master Schema (Users, Workspaces, Sites, Templates, AI) |
| `migrations/` | Modular SQL migrations for database setup and schema updates |
| `seeds/` | Initial seed data for plans, categories, and site templates |
| `ER-diagram.md` | Visual Entity-Relationship Diagram (Mermaid.js) |

## Key Architectural Decisions
- **Workspace-Centric Ownership:** Sites, subscriptions, and team members belong to Workspaces rather than individual users to support multi-tenant SaaS features.
- **JSONB for Dynamic Layouts:** Page sections, component configurations, and theme settings are stored in flexible `JSONB` format inside the `sections` table.
- **AI Assistant Integration:** Chat history and message contexts are linked directly to `workspaces` and `sites` for context-aware site generation.
- **Security & Integrity:** Passwords are stored exclusively as secure hashes (`password_hash`), and primary keys utilize UUIDs (`gen_random_uuid()`).

## Usage & Execution

To initialize the database locally, execute the master schema followed by the seeds:

```bash
psql -U postgres -d sitebuilder_db -f database/schema.sql
psql -U postgres -d sitebuilder_db -f database/seeds/001_initial_plans_and_templates.sql
psql -U postgres -d sitebuilder_db -f database/seeds/002_template_seeds.sql