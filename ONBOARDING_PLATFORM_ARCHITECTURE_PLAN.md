# 🏛️ ONBOARDING PLATFORM ARCHITECTURE PLAN

This document is the definitive master plan for the Employee Onboarding Platform's architecture. It details the database schema, API contracts, service architecture, and security protocols required to build a production-grade, horizontally scalable application.

---

## 1. System Architecture Overview
The platform utilizes a **Modular Monolith** architecture. This avoids the operational complexity of dozens of microservices while keeping domains strictly bounded, allowing us to easily extract microservices (e.g., the Notification Service or Grading Engine) later if scaling demands it.

### High-Level Flow
1. **Client** (React SPA) requests assets from **AWS CloudFront** (CDN).
2. API requests hit an **AWS Application Load Balancer (ALB)**.
3. ALB routes to **Node.js Auto-Scaling Group (EC2/EKS)**.
4. Services read/write state to **Amazon ElastiCache (Redis)** (Sessions, Caching) and **Amazon RDS (PostgreSQL)** (Persistent data).

---

## 2. Database Schema (PostgreSQL)
*All tables utilize UUID v4 as primary keys, soft-delete functionality (`deleted_at`), and default `created_at`/`updated_at` timestamps.*

### Identity & Access Domain
1. **`users`**: `id`, `email`, `password_hash`, `first_name`, `last_name`, `role_id`, `department`, `status`. *(Indexes: email, status)*
2. **`roles`**: `id`, `name` (e.g., Admin, Mentor, Candidate), `permissions_json`.
3. **`audit_logs`**: `id`, `actor_id`, `action`, `target_table`, `target_id`, `changes_json`, `ip_address`.

### Core Learning Domain
4. **`modules`**: `id`, `title`, `description`, `order_index`, `is_published`.
5. **`lessons`**: `id`, `module_id`, `type` (Video/Markdown/PDF), `content_url`, `est_time_minutes`.
6. **`module_prerequisites`**: `id`, `module_id`, `depends_on_module_id`. *(Enforces directed acyclic graph for learning paths).*
7. **`user_progress`**: `id`, `user_id`, `module_id`, `status` (Locked/InProgress/Completed), `completion_date`.

### Assessment Domain
8. **`quizzes`**: `id`, `module_id`, `passing_score_percentage`, `time_limit_minutes`.
9. **`quiz_questions`**: `id`, `quiz_id`, `question_text`, `type` (MCQ, Boolean).
10. **`quiz_options`**: `id`, `question_id`, `option_text`, `is_correct` (Boolean).
11. **`user_quiz_attempts`**: `id`, `user_id`, `quiz_id`, `score`, `passed` (Boolean), `answers_json`.
12. **`tasks`**: `id`, `module_id`, `instructions_text`, `max_score`, `rubric_json`.
13. **`task_submissions`**: `id`, `task_id`, `user_id`, `status` (Pending/Graded/Rejected), `file_url`, `score`, `feedback_text`, `grader_id`.

### Social & Notification Domain
14. **`mentorships`**: `id`, `mentor_id`, `mentee_id`, `status` (Active, Completed).
15. **`notifications`**: `id`, `user_id`, `title`, `body_text`, `type` (System, Task, Mentor), `is_read`.

---

## 3. API Contract Specifications (RESTful)
*All endpoints are prefixed with `/api/v1`. Authentication relies on `Authorization: Bearer <token>` headers.*

### Auth & User Management
- `POST /auth/login` → Validates credentials, returns JWT & Refresh Token.
- `POST /auth/refresh` → Exchanges refresh token for new JWT.
- `GET /users/me` → Returns profile, roles, and current mentorship ties.
- `GET /users` *(Admin)* → Paginated list of candidates, filterable by department.

### Learning Modules
- `GET /modules` → Returns tree of modules (filters out unpublished for candidates).
- `GET /modules/:id` → Fetches specific module details and associated lessons.
- `POST /modules` *(Admin)* → Creates a new module.
- `POST /modules/:id/lessons` *(Admin)* → Appends learning material.
- `POST /modules/:id/complete` → Candidate signs off on viewing module material. Triggers progress recalculation.

### Assessments (Quizzes & Tasks)
- `GET /quizzes/:id` → Returns quiz metadata and mixed questions (without `is_correct` answers).
- `POST /quizzes/:id/submit` → Calculates grade securely server-side. Returns Pass/Fail.
- `POST /tasks/:id/submit` → Accepts multipart form data (files up to 50MB) uploading to S3, creating a `Pending` submission.
- `PUT /tasks/submissions/:id/grade` *(Admin)* → Updates score, leaves feedback, fires notification to candidate.

### Analytics & Mentorship
- `GET /analytics/cohort-completion` *(Admin)* → Aggregated scores and completion % for D3.js/Recharts.
- `POST /mentorships/match` *(Admin)* → Assigns mentor to mentee, fires introduction emails via SendGrid.

---

## 4. Scalability & Performance SLAs
* **SLA Target:** `<200ms` response times for 95th percentile operations.
* **Caching Strategy:**
  - `GET /modules` relies heavily on Redis as global module structures rarely change throughout the day. Cache is invalidated upon `PUT /modules`.
  - User-specific progress queries bypass caching to ensure real-time accuracy.
* **Database Throttling:** 
  - Connection pooling via `pgbouncer`.
  - Heavy Excel export logic (`GET /analytics/export`) pushes a job to a Redis Queue (BullMQ), processed by background workers, returning an S3 download link via webhook/polling.

---

## 5. Security & Compliance (SOC2 / GDPR)
1. **OWASP Top 10 Protections:**
   - *SQL Injection*: Prevented by mandatory ORM/Query Builder usage. No raw concatenated SQL permitted.
   - *XSS*: React naturally escapes JSX. Markdown rendering uses strict sanitizers (`DOMPurify`).
   - *Rate Limiting*: `express-rate-limit` caps login attempts to 5 per 15 minutes.
2. **Data Privacy (GDPR):**
   - **Soft Deletions**: Deleting a user nullifies PII (email, name) turning them into an anonymous "Deleted User" to maintain aggregate analytics integrity without violating Right to be Forgotten.
3. **Encryption:**
   - Passwords hashed using `Argon2` (preferred over bcrypt for memory-hardness).
   - Data at rest encrypted via AWS EBS/RDS KMS Keys.
   - Files uploaded to S3 are private by default, accessed only via short-lived (15 min) pre-signed URLs.

---
*End of Document. Implementation engineers should map these systems directory to the provided templates.*
