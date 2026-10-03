-- =====================================================================
-- ManageSystem - ilkin verilənlər bazası sxemi (PostgreSQL)
-- Mənbə: docs/frontend-api-handoff.md (akademik idarəetmə hissəsi)
-- Qeyd: sayt qurucusu (websites, pages, media...) hissəsi bura
--       hələ daxil edilməyib, ayrı mərhələdə əlavə olunacaq.
-- =====================================================================

BEGIN;

-- ---------- Enum tipləri ----------
CREATE TYPE user_role         AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'USER');
CREATE TYPE record_status     AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE class_status      AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED');
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
CREATE TYPE assessment_status AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- ---------- Ortaq: updated_at avtomatik yenilənsin ----------
CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------- İstifadəçilər ----------
CREATE TABLE users (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name           VARCHAR(150) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,          -- parol heç vaxt açıq saxlanmır
  role           user_role    NOT NULL DEFAULT 'USER',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- email böyük/kiçik hərfdən asılı olmayaraq unikal olsun
CREATE UNIQUE INDEX users_email_unique ON users (lower(email));

CREATE TABLE students (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  status     record_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE teachers (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Struktur: kafedra -> fənn -> kurs ----------
CREATE TABLE departments (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subjects (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  name          VARCHAR(150) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (department_id, name)
);

CREATE TABLE courses (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  teacher_id BIGINT REFERENCES teachers(id) ON DELETE SET NULL,
  name       VARCHAR(150) NOT NULL,
  code       VARCHAR(30)  NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Tədris ili və semestr (ID ilə) ----------
CREATE TABLE academic_years (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       VARCHAR(20) NOT NULL UNIQUE,        -- məs: 2025-2026
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  status     record_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date > start_date)
);

CREATE TABLE semesters (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  academic_year_id BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name             VARCHAR(50) NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (academic_year_id, name)
);

-- ---------- Siniflər ----------
-- DİQQƏT: sənədə görə academic_year və semester burada MƏTN kimi
-- saxlanır (ID yox). Bunu ID-yə çevirməyin.
CREATE TABLE classes (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id     BIGINT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  teacher_id    BIGINT REFERENCES teachers(id) ON DELETE SET NULL,
  name          VARCHAR(150) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  semester      VARCHAR(50) NOT NULL,
  schedule_days SMALLINT[] NOT NULL DEFAULT '{}',   -- 1=Bazar ertəsi ... 7=Bazar
  start_time    TIME,
  end_time      TIME,
  capacity      INTEGER NOT NULL DEFAULT 30 CHECK (capacity > 0),
  status        class_status NOT NULL DEFAULT 'ACTIVE',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time)
);

-- ---------- Qeydiyyat (tələbə <-> sinif, çox-çox) ----------
CREATE TABLE enrollments (
  student_id  BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id    BIGINT NOT NULL REFERENCES classes(id)  ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, class_id)               -- təkrar qeydiyyatın qarşısı
);

-- Sinif tutumu dolubsa yeni qeydiyyat rədd edilsin (API-də 409 olacaq)
CREATE FUNCTION check_class_capacity() RETURNS trigger AS $$
DECLARE
  cap      INTEGER;
  enrolled INTEGER;
BEGIN
  SELECT capacity INTO cap FROM classes WHERE id = NEW.class_id FOR UPDATE;
  SELECT count(*) INTO enrolled FROM enrollments WHERE class_id = NEW.class_id;
  IF enrolled >= cap THEN
    RAISE EXCEPTION 'class capacity reached' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enrollments_capacity
  BEFORE INSERT ON enrollments
  FOR EACH ROW EXECUTE FUNCTION check_class_capacity();

-- ---------- Dərs cədvəli ----------
CREATE TABLE schedules (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  academic_year_id BIGINT REFERENCES academic_years(id) ON DELETE SET NULL,
  semester_id      BIGINT REFERENCES semesters(id)      ON DELETE SET NULL,
  class_id         BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  course_id        BIGINT REFERENCES courses(id)  ON DELETE SET NULL,
  teacher_id       BIGINT REFERENCES teachers(id) ON DELETE SET NULL,
  day_of_week      SMALLINT CHECK (day_of_week BETWEEN 1 AND 7),
  date             DATE,                              -- tək tarixli dərs üçün
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_time > start_time),
  CHECK (day_of_week IS NOT NULL OR date IS NOT NULL)
);

-- ---------- Davamiyyət ----------
CREATE TABLE attendance (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  class_id   BIGINT NOT NULL REFERENCES classes(id)  ON DELETE CASCADE,
  student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  status     attendance_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, student_id, date)                -- eyni gün iki qeyd olmasın
);

-- ---------- Qiymətləndirmə və qiymətlər ----------
CREATE TABLE assessments (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id  BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  class_id   BIGINT REFERENCES classes(id) ON DELETE CASCADE,
  name       VARCHAR(150) NOT NULL,
  type       VARCHAR(50)  NOT NULL,                  -- məs: Quiz, Imtahan
  status     assessment_status NOT NULL DEFAULT 'DRAFT',
  max_score  NUMERIC(6,2) CHECK (max_score > 0),
  date       DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GPA/orta bal burada SAXLANMIR; lazım olanda sorğu ilə hesablanır.
CREATE TABLE grades (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id      BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id       BIGINT NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  assessment_id   BIGINT REFERENCES assessments(id) ON DELETE SET NULL,
  score           NUMERIC(6,2) NOT NULL CHECK (score >= 0),
  max_score       NUMERIC(6,2) CHECK (max_score > 0),
  notes           TEXT,
  assessment_type VARCHAR(50),
  assessment_name VARCHAR(150),
  assessment_date DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (max_score IS NULL OR score <= max_score)
);

-- ---------- İndekslər (filtr və JOIN-lər üçün) ----------
CREATE INDEX idx_subjects_department   ON subjects(department_id);
CREATE INDEX idx_courses_subject       ON courses(subject_id);
CREATE INDEX idx_courses_teacher       ON courses(teacher_id);
CREATE INDEX idx_semesters_year        ON semesters(academic_year_id);
CREATE INDEX idx_classes_course        ON classes(course_id);
CREATE INDEX idx_classes_teacher       ON classes(teacher_id);
CREATE INDEX idx_enrollments_class     ON enrollments(class_id);
CREATE INDEX idx_schedules_class       ON schedules(class_id);
CREATE INDEX idx_schedules_teacher_day ON schedules(teacher_id, day_of_week);
CREATE INDEX idx_attendance_student    ON attendance(student_id, date);
CREATE INDEX idx_assessments_course    ON assessments(course_id);
CREATE INDEX idx_grades_student        ON grades(student_id);
CREATE INDEX idx_grades_course         ON grades(course_id);

-- ---------- updated_at trigger-ləri ----------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','students','teachers','departments','subjects',
    'courses','academic_years','semesters','classes','schedules','assessments','grades']
  LOOP
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I
                    FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t || '_updated_at', t);
  END LOOP;
END $$;

COMMIT;