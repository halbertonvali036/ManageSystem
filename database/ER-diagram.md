# SiteBuilder Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ SUBSCRIPTIONS : "has"
    USERS ||--o{ SITES : "owns"
    USERS ||--o{ AI_CONVERSATIONS : "initiates"
    USERS ||--o{ AI_USAGE : "tracks"
    
    PLANS ||--o{ SUBSCRIPTIONS : "defines"
    
    TEMPLATES ||--o{ TEMPLATE_PAGES : "contains"
    TEMPLATES ||--o{ SITES : "used_by"
    TEMPLATE_PAGES ||--o{ TEMPLATE_SECTIONS : "contains"
    
    SITES ||--o{ PAGES : "contains"
    SITES ||--o{ AI_CONVERSATIONS : "context_for"
    PAGES ||--o{ SECTIONS : "contains"
    
    AI_CONVERSATIONS ||--o{ AI_MESSAGES : "contains"
    AI_MESSAGES ||--o{ AI_PROPOSALS : "generates"
    SECTIONS ||--o{ AI_PROPOSALS : "targeted_by"

    USERS {
        uuid id PK
        string email
        string password_hash
        string full_name
        role_enum role
    }

    PLANS {
        uuid id PK
        string name
        boolean is_premium
        int max_sites
        int ai_monthly_token_limit
    }

    SUBSCRIPTIONS {
        uuid id PK
        uuid user_id FK
        uuid plan_id FK
        string status
    }

    TEMPLATES {
        uuid id PK
        string name
        string category
        boolean is_premium
        boolean is_published
        jsonb theme_config
    }

    TEMPLATE_PAGES {
        uuid id PK
        uuid template_id FK
        string title
        string slug
        boolean is_home
    }

    TEMPLATE_SECTIONS {
        uuid id PK
        uuid template_page_id FK
        string section_type
        jsonb content
        jsonb styles
    }

    SITES {
        uuid id PK
        uuid user_id FK
        uuid template_id FK
        string title
        string subdomain
        string custom_domain
        site_status_enum status
    }

    PAGES {
        uuid id PK
        uuid site_id FK
        string title
        string slug
        boolean is_home
    }

    SECTIONS {
        uuid id PK
        uuid page_id FK
        string section_type
        jsonb content
        jsonb styles
    }

    AI_CONVERSATIONS {
        uuid id PK
        uuid user_id FK
        uuid site_id FK
        string title
    }

    AI_MESSAGES {
        uuid id PK
        uuid conversation_id FK
        ai_role_enum role
        text content
    }

    AI_PROPOSALS {
        uuid id PK
        uuid message_id FK
        uuid target_section_id FK
        jsonb proposed_changes
        proposal_status_enum status
    }

    AI_USAGE {
        uuid id PK
        uuid user_id FK
        int tokens_used
        string action_type
    }