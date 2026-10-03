# Database

This folder contains the database schema for the ManageSystem project.

| File | Content |
|---|---|
| `schema.sql` | PostgreSQL tables, relations, indexes and triggers |
| `schema-website-builder.sql` | Website builder tables (run after `schema.sql`) |
| `ER-diagram.md` | Entity-relationship diagrams of both parts |

## Source
`docs/frontend-api-handoff.md` (academic management part).

## Key decisions
- `classes.academic_year` and `classes.semester` are stored as plain text,
  as required by the handoff document.
- `enrollments` has a unique (student_id, class_id) pair; class capacity is
  enforced by a trigger.
- GPA / averages are not stored; they are computed with queries.
- Passwords are stored only as hashes.

## Website builder part
Based on `docs/phase-9-publishing.md`, `phase-10-forms.md` and `phase12-motion.md`.
The editor document (sections, blocks, form definitions, motion, theme) is
stored as JSONB in `site_drafts.document`; domains, DNS records, media,
publications and form submissions have their own tables.
This part is a draft proposal and must be confirmed with the backend developer.

## Not included yet
- Plan & billing and notifications (no data contract in the docs yet).
- Teacher schedule overlap check (currently expected in the backend layer).

## Usage
```bash
psql -U <user> -d <database> -f database/schema.sql
psql -U <user> -d <database> -f database/schema-website-builder.sql
```