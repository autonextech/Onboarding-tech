# 📅 SPRINT ROADMAP & DETAILED EXECUTION PLAN

**Duration:** 8 Weeks
**Sprints:** 4 Sprints (2 Weeks each) or 8 Micro-Sprints (1 Week each). We will manage via 8 one-week micro-sprints for tighter feedback loops.
**Core Team:** 10 Members

---

## Sprint 1: Infrastructure & Foundation (Week 1)
**Goal:** Establish environments, CI/CD pipelines, and core database architecture.

* **Day 1-2:**
  - Setup AWS VPC, RDS (PostgreSQL), and ElastiCache (Redis).
  - Initialize Docker configurations (`docker-compose.yml`, `Dockerfile`).
  - Create base Git repository, branch protection rules, and GitHub Actions CI.
* **Day 3-5:**
  - Execute initial database schema migrations (Users, Roles, Modules).
  - Setup Node.js backend boilerplate with Express, logging (Morgan), and error handling.
  - Setup React 18 + Vite frontend boilerplate with Tailwind CSS and routing.

## Sprint 2: Authentication & User Profiles (Week 2)
**Goal:** Secure the platform and establish hierarchical user identities.

* **Day 1-3:**
  - Build Auth API (`/api/auth/login`, `/api/auth/refresh`, `/api/auth/reset-password`).
  - Implement JWT middleware and RBAC (Role-Based Access Control - Admin vs. Candidate).
* **Day 4-5:**
  - Create standard Login/Signup Frontend pages.
  - Create "My Profile" & "Meet the Team" directory views.
  - Integrate SendGrid for "Welcome" transactional emails.

## Sprint 3: Core Learning Modules (Week 3)
**Goal:** Admins can create content; Candidates can view content.

* **Day 1-3:**
  - Backend CRUD APIs for Modules and Sub-lessons.
  - S3 bucket integration for secure document and video uploads.
* **Day 4-5:**
  - Frontend Admin panel: Visual drag-and-drop course builder.
  - Frontend Candidate view: Smooth video player and PDF viewer integration.

## Sprint 4: Quizzes & Interactive Assessments (Week 4)
**Goal:** Implement auto-grading assessments to test candidate knowledge.

* **Day 1-3:**
  - DB schema for Quiz Banks, Questions (MCQ, Boolean), and User_Answers.
  - Backend grading engine to automatically calculated scores securely server-side.
* **Day 4-5:**
  - Frontend Quiz Builder UI (Admin).
  - Frontend Quiz Taking UI (Candidate) with timers and secure submission logic.

## Sprint 5: Tasks & Rubric Grading (Week 5)
**Goal:** Facilitate subjective assignments requiring manual review.

* **Day 1-3:**
  - Implement File Upload logic for candidate assignment submissions (S3 signed URLs).
  - Create unified Task inbox API for HR / Managers.
* **Day 4-5:**
  - Frontend submission portal for candidates.
  - Admin/Manager viewing UI with a rubric grading widget (Score 1-100, plus comments).

## Sprint 6: Progress Engine & Mentor System (Week 6)
**Goal:** Enforce prerequisites and connect candidates with veterans.

* **Day 1-3:**
  - "Condition Lock" logic: Modules that remain inactive until prerequisite quizzes/tasks reach a threshold score.
  - Mentor matching APIs (mapping specific candidates to senior employees).
* **Day 4-5:**
  - Notification Engine: Real-time alerts & emails to mentors when candidates complete a major milestone.
  - Candidate Progress Dashboard UI (Progress bars, badges).

## Sprint 7: Analytics & Reporting (Week 7)
**Goal:** Provide compliance insights and macro-level tracking for HR.

* **Day 1-3:**
  - Complex SQL views/aggregations for cohort completion rates.
  - Implement CSV/Excel export utility library in Node.js.
* **Day 4-5:**
  - Admin Dashboard reporting charts (using Recharts).
  - Detailed drill-down views clicking from cohort -> specific candidate.

## Sprint 8: QA, Polish & Production Launch (Week 8)
**Goal:** Ensure enterprise-grade stability and hand off to stakeholders.

* **Day 1-2:** QA Regression testing, fixing P1/P2 ui bugs. Map optimization (CSS minification checks).
* **Day 3:** Load testing the core endpoints using basic Artillery scripts (targeting 10k connections). Security audit for OWASP top 10 vulnerabilities.
* **Day 4:** Final staging review and UAT sign-off with stakeholders.
* **Day 5: 🚀 GO LIVE.** Switch DNS records, warm up caches, and begin rolling out initial candidate cohort.
