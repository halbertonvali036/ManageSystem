# ER diagram (academic part)

> GitHub renders this diagram automatically. In VS Code, install the
> "Markdown Preview Mermaid Support" extension and press Ctrl+Shift+V.

```mermaid
erDiagram
    users ||--o| students : "has account"
    users ||--o| teachers : "has account"
    departments ||--o{ subjects : "contains"
    subjects ||--o{ courses : "contains"
    teachers ||--o{ courses : "teaches"
    courses ||--o{ classes : "opened as"
    teachers ||--o{ classes : "leads"
    students ||--o{ enrollments : "enrolls in"
    classes ||--o{ enrollments : "has students"
    academic_years ||--o{ semesters : "divided into"
    classes ||--o{ schedules : "scheduled in"
    academic_years ||--o{ schedules : ""
    semesters ||--o{ schedules : ""
    classes ||--o{ attendance : "attendance"
    students ||--o{ attendance : ""
    courses ||--o{ assessments : "assessed by"
    classes ||--o{ assessments : ""
    students ||--o{ grades : "receives"
    courses ||--o{ grades : ""
    assessments ||--o{ grades : ""

    users {
        bigint id PK
        string name
        string email UK
        string password_hash
        enum role
    }
    students {
        bigint id PK
        bigint user_id FK
        enum status
    }
    teachers {
        bigint id PK
        bigint user_id FK
    }
    departments {
        bigint id PK
        string name UK
    }
    subjects {
        bigint id PK
        bigint department_id FK
        string name
    }
    courses {
        bigint id PK
        bigint subject_id FK
        bigint teacher_id FK
        string name
        string code UK
    }
    classes {
        bigint id PK
        bigint course_id FK
        bigint teacher_id FK
        string academic_year "text"
        string semester "text"
        int capacity
        enum status
    }
    enrollments {
        bigint student_id PK
        bigint class_id PK
    }
    academic_years {
        bigint id PK
        string name UK
        date start_date
        date end_date
    }
    semesters {
        bigint id PK
        bigint academic_year_id FK
        string name
    }
    schedules {
        bigint id PK
        bigint class_id FK
        smallint day_of_week
        time start_time
        time end_time
    }
    attendance {
        bigint id PK
        bigint class_id FK
        bigint student_id FK
        date date
        enum status
    }
    assessments {
        bigint id PK
        bigint course_id FK
        bigint class_id FK
        enum status
    }
    grades {
        bigint id PK
        bigint student_id FK
        bigint course_id FK
        bigint assessment_id FK
        numeric score
    }
```

## How to read it
- `||--o{` means one-to-many (e.g. one department has many subjects).
- `PK` = primary key, `FK` = foreign key, `UK` = unique value.
- `enrollments` links students and classes (many-to-many).
- `classes.academic_year` and `classes.semester` are plain text by design.