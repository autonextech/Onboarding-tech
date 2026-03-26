# Progress Tracking and Analytics

<cite>
**Referenced Files in This Document**
- [backend/src/routes/progress.ts](file://backend/src/routes/progress.ts)
- [backend/src/routes/analytics.ts](file://backend/src/routes/analytics.ts)
- [backend/src/routes/candidates.ts](file://backend/src/routes/candidates.ts)
- [backend/src/routes/modules.ts](file://backend/src/routes/modules.ts)
- [backend/src/routes/reports.ts](file://backend/src/routes/reports.ts)
- [backend/src/routes/quiz.ts](file://backend/src/routes/quiz.ts)
- [backend/src/lib/prisma.ts](file://backend/src/lib/prisma.ts)
- [backend/prisma/schema.prisma](file://backend/prisma/schema.prisma)
- [frontend/src/pages/CandidateDashboard.tsx](file://frontend/src/pages/CandidateDashboard.tsx)
- [frontend/src/pages/ModuleViewPage.tsx](file://frontend/src/pages/ModuleViewPage.tsx)
- [frontend/src/pages/AdminAnalyticsPage.tsx](file://frontend/src/pages/AdminAnalyticsPage.tsx)
- [frontend/src/store/useStore.ts](file://frontend/src/store/useStore.ts)
- [frontend/src/components/ui/ModuleCard.tsx](file://frontend/src/components/ui/ModuleCard.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document explains the progress tracking and analytics system in Onboarding AntiGravity. It covers real-time progress monitoring, module and section completion tracking, analytics dashboards, reporting capabilities, and system health monitoring. It also provides practical workflows, analytics interpretation tips, performance insights, and guidance on data privacy and reporting customization.

## Project Structure
The system comprises:
- Backend API routes for progress, analytics, candidates, modules, reports, and quiz scoring
- Prisma ORM models defining the data schema and relationships
- Frontend pages for candidate dashboards, module views, and admin analytics
- A shared Zustand store for user session and UI state

```mermaid
graph TB
subgraph "Backend"
P["progress.ts"]
A["analytics.ts"]
CAND["candidates.ts"]
MOD["modules.ts"]
REP["reports.ts"]
QUIZ["quiz.ts"]
PRISMA_LIB["lib/prisma.ts"]
SCHEMA["prisma/schema.prisma"]
end
subgraph "Frontend"
DASH["pages/CandidateDashboard.tsx"]
MODULE_VIEW["pages/ModuleViewPage.tsx"]
ADMIN_ANALYTICS["pages/AdminAnalyticsPage.tsx"]
STORE["store/useStore.ts"]
CARD["components/ui/ModuleCard.tsx"]
end
DASH --> |"GET /api/candidates/:id/dashboard"| CAND
MODULE_VIEW --> |"GET /api/modules/:id"| MOD
MODULE_VIEW --> |"GET /api/progress/:userId"| P
MODULE_VIEW --> |"POST /api/quiz/submit"| QUIZ
MODULE_VIEW --> |"POST /api/progress/section"| P
ADMIN_ANALYTICS --> |"GET /api/analytics/dashboard"| A
REP --> |"GET /api/reports, GET /api/reports/export"| REP
CAND --> |"Parallel fetch modules, progress, quiz attempts"| PRISMA_LIB
A --> |"Parallel counts and groupBy"| PRISMA_LIB
MOD --> |"Create/Update/Delete/Publish"| PRISMA_LIB
QUIZ --> |"Upsert quiz attempts"| PRISMA_LIB
P --> |"Upsert candidate progress"| PRISMA_LIB
SCHEMA -. defines .-> PRISMA_LIB
```

**Diagram sources**
- [backend/src/routes/progress.ts:1-63](file://backend/src/routes/progress.ts#L1-L63)
- [backend/src/routes/analytics.ts:1-55](file://backend/src/routes/analytics.ts#L1-L55)
- [backend/src/routes/candidates.ts:1-117](file://backend/src/routes/candidates.ts#L1-L117)
- [backend/src/routes/modules.ts:1-209](file://backend/src/routes/modules.ts#L1-L209)
- [backend/src/routes/reports.ts:1-114](file://backend/src/routes/reports.ts#L1-L114)
- [backend/src/routes/quiz.ts:1-76](file://backend/src/routes/quiz.ts#L1-L76)
- [backend/src/lib/prisma.ts:1-19](file://backend/src/lib/prisma.ts#L1-L19)
- [backend/prisma/schema.prisma:1-112](file://backend/prisma/schema.prisma#L1-L112)
- [frontend/src/pages/CandidateDashboard.tsx:1-138](file://frontend/src/pages/CandidateDashboard.tsx#L1-L138)
- [frontend/src/pages/ModuleViewPage.tsx:1-273](file://frontend/src/pages/ModuleViewPage.tsx#L1-L273)
- [frontend/src/pages/AdminAnalyticsPage.tsx:1-120](file://frontend/src/pages/AdminAnalyticsPage.tsx#L1-L120)
- [frontend/src/store/useStore.ts:1-77](file://frontend/src/store/useStore.ts#L1-L77)
- [frontend/src/components/ui/ModuleCard.tsx:1-56](file://frontend/src/components/ui/ModuleCard.tsx#L1-L56)

**Section sources**
- [backend/src/routes/progress.ts:1-63](file://backend/src/routes/progress.ts#L1-L63)
- [backend/src/routes/analytics.ts:1-55](file://backend/src/routes/analytics.ts#L1-L55)
- [backend/src/routes/candidates.ts:1-117](file://backend/src/routes/candidates.ts#L1-L117)
- [backend/src/routes/modules.ts:1-209](file://backend/src/routes/modules.ts#L1-L209)
- [backend/src/routes/reports.ts:1-114](file://backend/src/routes/reports.ts#L1-L114)
- [backend/src/routes/quiz.ts:1-76](file://backend/src/routes/quiz.ts#L1-L76)
- [backend/src/lib/prisma.ts:1-19](file://backend/src/lib/prisma.ts#L1-L19)
- [backend/prisma/schema.prisma:1-112](file://backend/prisma/schema.prisma#L1-L112)
- [frontend/src/pages/CandidateDashboard.tsx:1-138](file://frontend/src/pages/CandidateDashboard.tsx#L1-L138)
- [frontend/src/pages/ModuleViewPage.tsx:1-273](file://frontend/src/pages/ModuleViewPage.tsx#L1-L273)
- [frontend/src/pages/AdminAnalyticsPage.tsx:1-120](file://frontend/src/pages/AdminAnalyticsPage.tsx#L1-L120)
- [frontend/src/store/useStore.ts:1-77](file://frontend/src/store/useStore.ts#L1-L77)
- [frontend/src/components/ui/ModuleCard.tsx:1-56](file://frontend/src/components/ui/ModuleCard.tsx#L1-L56)

## Core Components
- Progress tracking API: Records section completion and retrieves a user’s completed sections.
- Candidate dashboard API: Computes real-time module progress, quiz scores, and overall stats.
- Analytics dashboard API: Aggregates platform-wide metrics via parallelized queries.
- Reports API: Generates per-candidate summaries and exports CSV.
- Quiz scoring API: Scores answers in bulk and persists attempt records.
- Frontend dashboards: Render real-time progress, module cards, and admin analytics.
- Prisma schema: Defines entities and relationships for progress, quiz attempts, modules, and sections.

Key responsibilities:
- Real-time progress monitoring: Section completion events and retrieval.
- Module progress calculation: Percentages derived from completed sections per module.
- Analytics: KPIs, weekly completions, and distribution charts.
- Reporting: Per-candidate progress and scores, with CSV export.
- Data privacy: Minimal PII exposure; sensitive fields excluded from responses.

**Section sources**
- [backend/src/routes/progress.ts:6-38](file://backend/src/routes/progress.ts#L6-L38)
- [backend/src/routes/candidates.ts:8-114](file://backend/src/routes/candidates.ts#L8-L114)
- [backend/src/routes/analytics.ts:7-52](file://backend/src/routes/analytics.ts#L7-L52)
- [backend/src/routes/reports.ts:83-111](file://backend/src/routes/reports.ts#L83-L111)
- [backend/src/routes/quiz.ts:6-73](file://backend/src/routes/quiz.ts#L6-L73)
- [frontend/src/pages/CandidateDashboard.tsx:7-57](file://frontend/src/pages/CandidateDashboard.tsx#L7-L57)
- [frontend/src/pages/ModuleViewPage.tsx:21-94](file://frontend/src/pages/ModuleViewPage.tsx#L21-L94)
- [frontend/src/pages/AdminAnalyticsPage.tsx:25-118](file://frontend/src/pages/AdminAnalyticsPage.tsx#L25-L118)
- [backend/prisma/schema.prisma:81-111](file://backend/prisma/schema.prisma#L81-L111)

## Architecture Overview
The system follows a clean separation of concerns:
- Backend routes orchestrate data retrieval and transformations.
- Prisma handles database operations and maintains referential integrity.
- Frontend pages consume APIs and render real-time dashboards.

```mermaid
sequenceDiagram
participant UI as "ModuleViewPage.tsx"
participant API as "progress.ts"
participant DB as "Prisma Client"
UI->>API : POST /api/progress/section {userId,moduleId,sectionId}
API->>DB : Upsert CandidateProgress
DB-->>API : CandidateProgress record
API-->>UI : {id,userId,moduleId,sectionId,completedAt}
Note over UI,DB : On subsequent loads, UI calls GET /api/progress/ : userId<br/>to hydrate completed sections
```

**Diagram sources**
- [frontend/src/pages/ModuleViewPage.tsx:57-69](file://frontend/src/pages/ModuleViewPage.tsx#L57-L69)
- [backend/src/routes/progress.ts:8-38](file://backend/src/routes/progress.ts#L8-L38)
- [backend/src/lib/prisma.ts:1-19](file://backend/src/lib/prisma.ts#L1-L19)

## Detailed Component Analysis

### Progress Tracking API
- Purpose: Persist and retrieve section completion for a user.
- Endpoints:
  - POST /api/progress/section: Upserts a completion record keyed by user and section.
  - GET /api/progress/:userId: Returns all completed section records for a user.

Processing logic:
- Validation ensures required fields are present.
- Upsert semantics update completion timestamp or create a new record.
- Retrieval returns sectionId, moduleId, and completion timestamp for UI hydration.

```mermaid
flowchart TD
Start(["POST /api/progress/section"]) --> Validate["Validate payload {userId,moduleId,sectionId}"]
Validate --> Valid{"All fields present?"}
Valid --> |No| Err["Return 400 Bad Request"]
Valid --> |Yes| Upsert["Upsert CandidateProgress (update or create)"]
Upsert --> Done(["Return 200 OK with record"])
Err --> Done
```

**Diagram sources**
- [backend/src/routes/progress.ts:8-38](file://backend/src/routes/progress.ts#L8-L38)

**Section sources**
- [backend/src/routes/progress.ts:6-38](file://backend/src/routes/progress.ts#L6-L38)

### Candidate Dashboard API
- Purpose: Serve a real-time, enriched view of modules, progress, and quiz scores for a candidate.
- Behavior:
  - Fetches published modules with sections and questions.
  - Retrieves user progress and quiz attempts in parallel.
  - Builds lookup structures for O(1) access.
  - Computes per-module progress percentage and per-module quiz score.
  - Determines module status (unlocked/in_progress/completed).
  - Aggregates overall progress and average quiz score.

```mermaid
sequenceDiagram
participant UI as "CandidateDashboard.tsx"
participant API as "candidates.ts"
participant DB as "Prisma Client"
UI->>API : GET /api/candidates/ : id/dashboard
API->>DB : Find user (include mentor)
API->>DB : FindMany modules (published, include sections/docs/questions)
API->>DB : GroupBy candidateProgress (by userId)
API->>DB : FindMany quizAttempts (by userId)
DB-->>API : User, Modules, Progress, QuizAttempts
API->>API : Build lookup maps and compute stats
API-->>UI : {user, modules[], stats}
```

**Diagram sources**
- [frontend/src/pages/CandidateDashboard.tsx:19-57](file://frontend/src/pages/CandidateDashboard.tsx#L19-L57)
- [backend/src/routes/candidates.ts:8-114](file://backend/src/routes/candidates.ts#L8-L114)
- [backend/src/lib/prisma.ts:1-19](file://backend/src/lib/prisma.ts#L1-L19)

**Section sources**
- [backend/src/routes/candidates.ts:8-114](file://backend/src/routes/candidates.ts#L8-L114)
- [frontend/src/pages/CandidateDashboard.tsx:7-57](file://frontend/src/pages/CandidateDashboard.tsx#L7-L57)

### Analytics Dashboard API
- Purpose: Provide platform-wide KPIs and recent candidates.
- Behavior:
  - Executes parallel queries for total candidates, published modules, recent candidates, and per-user progress counts.
  - Calculates average progress across users.
  - Returns metrics and recent candidates list.

```mermaid
sequenceDiagram
participant UI as "AdminAnalyticsPage.tsx"
participant API as "analytics.ts"
participant DB as "Prisma Client"
UI->>API : GET /api/analytics/dashboard
API->>DB : count(User where role=CANDIDATE)
API->>DB : count(Module where status=PUBLISHED)
API->>DB : findMany(User where role=CANDIDATE order desc, take 5)
API->>DB : groupBy(CandidateProgress by userId)
DB-->>API : Metrics and progress groups
API->>API : Compute average progress
API-->>UI : {metrics, recentCandidates}
```

**Diagram sources**
- [frontend/src/pages/AdminAnalyticsPage.tsx:25-32](file://frontend/src/pages/AdminAnalyticsPage.tsx#L25-L32)
- [backend/src/routes/analytics.ts:7-52](file://backend/src/routes/analytics.ts#L7-L52)
- [backend/src/lib/prisma.ts:1-19](file://backend/src/lib/prisma.ts#L1-L19)

**Section sources**
- [backend/src/routes/analytics.ts:7-52](file://backend/src/routes/analytics.ts#L7-L52)
- [frontend/src/pages/AdminAnalyticsPage.tsx:25-118](file://frontend/src/pages/AdminAnalyticsPage.tsx#L25-L118)

### Reports API
- Purpose: Generate per-candidate progress and quiz score summaries, with CSV export.
- Behavior:
  - Fetches all published modules and candidate data in parallel.
  - Builds maps for O(1) progress and quiz attempt lookups.
  - Computes module-level progress and score percentages.
  - Produces an overall summary and exports CSV.

```mermaid
sequenceDiagram
participant UI as "AdminReportsPage.tsx"
participant API as "reports.ts"
participant DB as "Prisma Client"
UI->>API : GET /api/reports
API->>DB : findMany(User where role=CANDIDATE include progress,quizAttempts)
API->>DB : findMany(Module where status=PUBLISHED include sections.questions)
DB-->>API : Candidates and Modules
API->>API : Build maps and compute stats
API-->>UI : Array of {userId,name,email,department,overallProgress,overallScore,moduleStats[]}
UI->>API : GET /api/reports/export
API-->>UI : CSV file attachment
```

**Diagram sources**
- [backend/src/routes/reports.ts:83-111](file://backend/src/routes/reports.ts#L83-L111)
- [backend/src/lib/prisma.ts:1-19](file://backend/src/lib/prisma.ts#L1-L19)

**Section sources**
- [backend/src/routes/reports.ts:6-81](file://backend/src/routes/reports.ts#L6-L81)
- [backend/src/routes/reports.ts:83-111](file://backend/src/routes/reports.ts#L83-L111)

### Quiz Scoring API
- Purpose: Submit answers for a section and persist attempt records.
- Behavior:
  - Validates payload and fetches all referenced questions in one query.
  - Computes correctness in-memory and batches upsert operations.
  - Executes all upserts in a single transaction for consistency.
  - Returns score percentage and counts.

```mermaid
flowchart TD
Start(["POST /api/quiz/submit"]) --> Validate["Validate {userId,sectionId,answers[]}"]
Validate --> Valid{"Payload valid?"}
Valid --> |No| Err["Return 400"]
Valid --> |Yes| Fetch["Fetch all referenced questions"]
Fetch --> Score["Compute correctness and build upsert ops"]
Score --> Tx["Execute transaction with upserts"]
Tx --> Result["Return {message,score,results}"]
Err --> Result
```

**Diagram sources**
- [backend/src/routes/quiz.ts:6-73](file://backend/src/routes/quiz.ts#L6-L73)

**Section sources**
- [backend/src/routes/quiz.ts:6-73](file://backend/src/routes/quiz.ts#L6-L73)

### Frontend Dashboards and UI Components
- CandidateDashboard:
  - Loads modules and stats via the candidate dashboard endpoint.
  - Renders overall progress ring, stats cards, and module cards.
- ModuleViewPage:
  - Hydrates module content and completed sections in parallel.
  - Provides “Mark Section Complete” and “Submit Answers” flows.
  - Updates local state after progress submission.
- AdminAnalyticsPage:
  - Displays KPIs and charts; placeholder loading indicates where live data would be fetched.
- ModuleCard:
  - Visualizes module progress and completion status.

```mermaid
graph LR
UI_DASH["CandidateDashboard.tsx"] --> API_CAND["/api/candidates/:id/dashboard"]
UI_MODULE["ModuleViewPage.tsx"] --> API_MOD["/api/modules/:id"]
UI_MODULE --> API_PROG["/api/progress/:userId"]
UI_MODULE --> API_QUIZ["/api/quiz/submit"]
UI_ADMIN["AdminAnalyticsPage.tsx"] --> API_ANA["/api/analytics/dashboard"]
UI_CARD["ModuleCard.tsx"] --> UI_DASH
```

**Diagram sources**
- [frontend/src/pages/CandidateDashboard.tsx:19-57](file://frontend/src/pages/CandidateDashboard.tsx#L19-L57)
- [frontend/src/pages/ModuleViewPage.tsx:21-94](file://frontend/src/pages/ModuleViewPage.tsx#L21-L94)
- [frontend/src/pages/AdminAnalyticsPage.tsx:25-32](file://frontend/src/pages/AdminAnalyticsPage.tsx#L25-L32)
- [frontend/src/components/ui/ModuleCard.tsx:6-55](file://frontend/src/components/ui/ModuleCard.tsx#L6-L55)

**Section sources**
- [frontend/src/pages/CandidateDashboard.tsx:7-137](file://frontend/src/pages/CandidateDashboard.tsx#L7-L137)
- [frontend/src/pages/ModuleViewPage.tsx:21-273](file://frontend/src/pages/ModuleViewPage.tsx#L21-L273)
- [frontend/src/pages/AdminAnalyticsPage.tsx:25-118](file://frontend/src/pages/AdminAnalyticsPage.tsx#L25-L118)
- [frontend/src/components/ui/ModuleCard.tsx:6-55](file://frontend/src/components/ui/ModuleCard.tsx#L6-L55)

## Dependency Analysis
- Backend routes depend on Prisma for data access and transactions.
- Candidate dashboard and reports rely on parallel queries and map-based lookups for performance.
- Frontend pages depend on backend endpoints for real-time data.
- Prisma schema defines foreign keys and indexes that support efficient queries.

```mermaid
erDiagram
USER {
string id PK
string name
string email UK
string role
string department
boolean isActive
string mentorId FK
}
MODULE {
string id PK
string title
string description
string status
string assessmentUrl
}
SECTION {
string id PK
string moduleId FK
string title
string description
string videoUrl
string videoDuration
int order
}
DOCUMENT {
string id PK
string sectionId FK
string title
string type
string url
}
QUIZ_QUESTION {
string id PK
string sectionId FK
string question
string options
int correctOptionIndex
}
CANDIDATE_PROGRESS {
string id PK
string userId FK
string moduleId FK
string sectionId FK
datetime completedAt
}
QUIZ_ATTEMPT {
string id PK
string userId FK
string questionId FK
int chosenIndex
boolean isCorrect
datetime attemptedAt
}
USER ||--o{ CANDIDATE_PROGRESS : "has"
MODULE ||--o{ SECTION : "contains"
SECTION ||--o{ DOCUMENT : "includes"
SECTION ||--o{ QUIZ_QUESTION : "includes"
USER ||--o{ QUIZ_ATTEMPT : "submits"
QUIZ_QUESTION ||--o{ QUIZ_ATTEMPT : "referenced_by"
SECTION ||--o{ CANDIDATE_PROGRESS : "tracked_by"
```

**Diagram sources**
- [backend/prisma/schema.prisma:10-111](file://backend/prisma/schema.prisma#L10-L111)

**Section sources**
- [backend/prisma/schema.prisma:10-111](file://backend/prisma/schema.prisma#L10-L111)

## Performance Considerations
- Parallelization:
  - Analytics dashboard runs multiple queries concurrently to reduce latency.
  - Candidate dashboard and module view fetch related data in parallel.
- Efficient lookups:
  - Hash maps and sets enable O(1) access for progress and quiz attempts.
- Transactional writes:
  - Quiz submissions batch upserts in a single transaction to minimize round-trips.
- Indexing:
  - Unique and indexed fields (e.g., user-section composite key) optimize upserts and joins.

Recommendations:
- Monitor Prisma query logs in development to identify slow queries.
- Consider caching frequently accessed module metadata for high traffic.
- Add pagination for large lists (e.g., reports) to control payload sizes.

**Section sources**
- [backend/src/routes/analytics.ts:9-30](file://backend/src/routes/analytics.ts#L9-L30)
- [backend/src/routes/candidates.ts:21-40](file://backend/src/routes/candidates.ts#L21-L40)
- [backend/src/routes/quiz.ts:16-57](file://backend/src/routes/quiz.ts#L16-L57)
- [backend/src/lib/prisma.ts:3-16](file://backend/src/lib/prisma.ts#L3-L16)

## Troubleshooting Guide
Common issues and resolutions:
- Missing required fields on progress submission:
  - Ensure userId, moduleId, and sectionId are provided.
  - Verify the payload structure matches expectations.
- Quiz submission errors:
  - Confirm question IDs exist and answers include questionId and chosenIndex.
  - Check that the chosen index aligns with the stored options array.
- Dashboard not rendering data:
  - Confirm the user exists and has associated progress/quiz attempts.
  - Verify published modules are available.
- Analytics endpoint failures:
  - Review Prisma client logs for database errors.
  - Ensure database connectivity and credentials are correct.

Operational checks:
- Validate Prisma client singleton initialization and logging levels.
- Inspect network tab for failed requests and error payloads.
- Confirm frontend environment variables for API base URL are set.

**Section sources**
- [backend/src/routes/progress.ts:10-14](file://backend/src/routes/progress.ts#L10-L14)
- [backend/src/routes/quiz.ts:10-14](file://backend/src/routes/quiz.ts#L10-L14)
- [backend/src/routes/candidates.ts:12-19](file://backend/src/routes/candidates.ts#L12-L19)
- [backend/src/lib/prisma.ts:3-16](file://backend/src/lib/prisma.ts#L3-L16)

## Conclusion
Onboarding AntiGravity’s progress tracking and analytics system combines efficient backend APIs with real-time frontend dashboards. Section completion and quiz scoring are captured reliably, while candidate and admin dashboards reflect accurate, computed metrics. Parallel queries, map-based lookups, and transactional writes underpin performance. Reporting and export capabilities provide actionable insights, and the schema supports scalability and integrity.

## Appendices

### Progress Tracking Workflows
- Section completion:
  - Candidate completes learning material and clicks “Mark Section Complete.”
  - Frontend posts to the progress endpoint; UI updates immediately.
- Quiz submission:
  - Candidate answers questions and submits.
  - Backend validates, computes score, persists attempts, and marks section complete.

```mermaid
sequenceDiagram
participant UI as "ModuleViewPage.tsx"
participant PROG as "progress.ts"
participant QUIZ as "quiz.ts"
participant DB as "Prisma Client"
UI->>PROG : POST /api/progress/section
PROG->>DB : Upsert CandidateProgress
UI->>QUIZ : POST /api/quiz/submit
QUIZ->>DB : Transaction upsert QuizAttempt
QUIZ-->>UI : {score, correctCount, totalQuestions}
UI->>PROG : POST /api/progress/section (auto after quiz)
```

**Diagram sources**
- [frontend/src/pages/ModuleViewPage.tsx:57-94](file://frontend/src/pages/ModuleViewPage.tsx#L57-L94)
- [backend/src/routes/progress.ts:8-38](file://backend/src/routes/progress.ts#L8-L38)
- [backend/src/routes/quiz.ts:6-73](file://backend/src/routes/quiz.ts#L6-L73)

### Analytics Interpretation Tips
- Average progress: Reflects overall completion rate across users; rising trends indicate improved engagement.
- Weekly completions: Use to identify peak activity days and plan content releases accordingly.
- Progress distribution: Highlights completion buckets; investigate low-performing segments for targeted interventions.

### Performance Insights
- Parallel queries reduce dashboard load times.
- Map-based aggregations minimize repeated scans over large datasets.
- Transactions ensure quiz scoring consistency without partial writes.

### Data Privacy Considerations
- Candidate dashboard excludes sensitive fields (e.g., password hash) from user payloads.
- Analytics and reports focus on aggregated metrics; personal identifiers are not exposed in charts.
- Access controls should be enforced at the API gateway/admin panel level to prevent unauthorized access.

### Reporting Customization Options
- Reports endpoint returns per-candidate summaries suitable for CSV export.
- Admin analytics page currently uses mock data; integrate with the analytics endpoint for live metrics.
- Extend endpoints to filter by date range, department, or module to tailor insights.