# Frontend → Backend API Handoff

Reference for the backend developer connecting the existing frontend.
The frontend is ready and does NOT require the backend to adopt any exact
framework shape — these are the contracts it already understands.

## Final status (2026-09)

-   Frontend service layer is complete and ready to consume a real API.
-   Auth is currently mock/demo-only (`authService` + demo role selector);
    the backend is expected to provide real token-based auth (login/logout/me).
-   Teacher Profile is intentionally pending — it renders a placeholder until
    a real profile endpoint is available.
-   Demo login must be removed when real backend auth is integrated.
-   Error handling for 401/403/404/409/422/500 is already prepared in
    `src/services/httpClient.js` and `src/utils/apiErrors.js`.

## Conventions (already implemented client-side)

- Single HTTP client: `src/services/httpClient.js` (base URL from `VITE_API_BASE_URL`).
  Nothing is hardcoded in components; all services read `config.api.baseUrl` and
  short-circuit to empty lists when it is unset.
- Error taxonomy (already implemented): `RequestError` carries `status`, `code`, `data`;
  `httpErrorCodeForStatus` maps 400/401/403/404/422/500+; `getRequestErrorCode` /
  `getRequestErrorMessage` give stable codes + messages. Reuse — do not duplicate.
- Field error normalization: `src/utils/apiErrors.js` → `normalizeFieldErrors`
  (flat `{ field: message }`) and `getSubmitFeedback`. Forms render
  `serverFieldErrors` + `submitError`; mutations track `dirty`/`isSaving`/
  `saveError`/`savedSuccessfully`/`validationMessage`.
- Identity: authenticated identity is inferred on the backend from auth scope. The
  frontend NEVER sends `teacherId`/`studentId` in My‑X calls and NEVER hardcodes them.
- No frontend "conflict engine": 409/422/field errors are surfaced, not resolved, in the UI.
- No fake data anywhere; mutations throw `BackendNotConnectedError` when not connected.

## Per-resource summary (frontend expectation)

### Auth
- Service: `authService`
- Operations: login, logout, me, change password, sign up (student self-service).
- Expects: token-based identity; `me` returns `{ id, name, email, role }`.

### Students
- Service: `studentService` (admin) / `useStudents`; student self-view via `/student/*`.
- Ops: list, get, create, update, delete.
- IDs: `studentId` (query param `studentId`), requires `classId`/enrollment join for rosters.
- Filters: `search`, `status`, `classId`.

### Teachers
- Service: `teacherService` (admin) / `useTeachers`.
- Ops: list, get, create, update, delete.
- ID: `teacherId`; joined to classes (`teacherId` on class) and users via `userId`.

### Departments / Subjects
- Services: `departmentsService`, `subjectsService`.
- Ops: list/get/create/update/delete.
- IDs: `departmentId`, `subjectId`; subject requires `departmentId`.

### Courses
- Service: `coursesService`, `useCourses/useCourse`.
- Ops: list/get/create/update/delete.
- ID: `courseId`; linked to `subjectId` + `teacherId`; filters `search/name/code/departmentId`.

### Classes
- Service: `classesService`, `useClasses/useClass`.
- Ops: list/get/create/update/delete.
- Relationships: `courseId`, `teacherId`, free-text `academicYear`/`semester` names,
  `schedule` (days + time range), `capacity`, `status`.
- Filters: `search/course/teacher/academicYear/semester/status`.

### Enrollments
- Service: `enrollmentsService` / `useEnrollStudents` + roster readers.
- Ops: list (`classId`, `studentId`), add student to class, remove student from class.
- Identity: `studentId` + `classId`; uses the class roster (no separate data source).

### Academic Years / Semesters
- Services: `academicYearsService`, `semestersService` (admin); `useAcademicYears`,
  `useSemesters`.
- Ops: list/get/create/update/delete.
- ID‑based: `semestersService` via `/academic-years/:id/semesters` (ID‑dependent selects);
  IDs `academicYearId`/`semesterId`. NOTE: the **Class** module intentionally stores
  free-text `academicYear`/`semester` NAMES (kept for backward compat) — do not convert
  both to IDs; classes keep names unless a dedicated refactor is agreed.
  Academic years use `name` labels (`2025-2026`), `startDate`, `endDate`, `status`.

### Schedules
- Service: `schedulesService` / teacher `useMySchedule`, student `useMySchedule`.
- Ops: list/get/create/update/delete.
- ID‑based: `academicYearId`/`semesterId`/`classId`/`courseId`/`teacherId`;
  filters `search/academicYearId/semesterId/classId/courseId/teacherId/dayOfWeek/date`.
- Derived into teacher/student "My Schedule" via auth scope (no extra ids sent).

### Attendance
- Service: `attendanceService` (admin), teacher `useMyClassStudents`-based marking,
  student read-only.
- Ops: list, get, create marks (bulk `POST`), delete.
- Statuses: `PRESENT/ABSENT/LATE/EXCUSED` via shared Attendance model constants.
- Marking requires `classId` + `date` + real roster; teacher/student read-only views
  in their portals.

### Assessments
- Service: `assessmentsService`, teacher `useMyAssessments`, student read-only.
- Ops: list/get/create/update/delete; no assessmentId sent unless creating.
- Relationships: `courseId`/`classId`-scoped; statuses `DRAFT/PUBLISHED/CLOSED`;
  type labels from the shared Assessment model.

### Grades
- Service: `gradesService` (admin), `useMyGrades`/`useMyGrade` (teacher/student read-only).
- Ops: list/get/create/update/delete; bulk save `POST /grades/bulk`.
- Keys: `studentId` + `courseId` + `assessmentId` (optional); `score`, `notes`,
  `assessmentType`, `assessmentName`, `assessmentDate`, `maxScore`.
- Read-only student view; grades reference `assessmentId` where present; no GPA/average
  computed client-side.

## Backend-side notes (items 13–15)

- Teacher/Student endpoints: infer `teacherId`/`studentId` from authenticated identity.
  Admin endpoints are system-wide.
- Return errors: 401/403/404/409/422 with `{ message, errors? }` where `errors` maps
  field→string[] (e.g. `email`, `classId`, `courseId`, `semesterId`, `score`). The
  frontend normalizes these into per-field + form-level errors automatically.
- Conflicts (409): duplicate record, duplicate enrollment, class capacity reached,
  schedule overlap, teacher schedule conflict — return a clear `message`; the frontend
  displays it in the form error area. No fake resolution.
- Do not invent endpoints; reuse the operations above registered under a single base URL.
