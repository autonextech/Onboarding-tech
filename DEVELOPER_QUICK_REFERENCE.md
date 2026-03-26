# 👨‍💻 DEVELOPER QUICK REFERENCE

Keep this document open during your first few weeks. It contains essential commands, patterns, and troubleshooting steps for the Onboarding Platform.

## 🚀 1. Day 1 Setup (From Zero to Running)

**Prerequisites:** Node.js v20+, Docker Desktop installed.

```bash
# 1. Clone the repository
git clone git@github.com:your-org/onboarding-platform.git
cd onboarding-platform

# 2. Setup Environment Variables
cp .env.example .env

# 3. Start Database and Redis via Docker
docker-compose up -d database redis

# 4. Install dependencies (Root, Frontend, Backend)
npm run install:all

# 5. Run Database Migrations & Seed Data
npm run db:migrate
npm run db:seed

# 6. Start the Development Servers
npm run dev
# Frontend runs on http://localhost:5173
# Backend runs on http://localhost:3000
```

## 🌳 2. Git Branching Strategy
We use a streamlined feature-branch workflow.
- `main`: Production-ready code.
- `staging`: Pre-production testing environment.
- Feature branches: `feat/username/ticket-id-short-desc` (e.g., `feat/jdoe/ONB-123-quiz-ui`).
- Bugfix branches: `fix/username/ticket-id-short-desc`.

*Commit Message Format (Conventional Commits):*
`feat(auth): implement JWT refresh token rotation`
`fix(quiz): resolve infinite loop on submit`

## 🛠️ 3. Common Development Tasks

**Adding a new Database Table (Prisma/TypeORM example):**
1. Modify your schema file.
2. Generate migration: `npm run db:generate "add_new_table"`
3. Apply migration: `npm run db:migrate`
4. Update TS Types: `npm run types:generate`

**Creating a New React Component:**
Generate scaffolding using our utility:
`npm run generate:component UserProfile`
*(This creates the .tsx file, tests, and storybook entries automatically)*

## 🔍 4. Common SQL Queries for Debugging
Access the DB directly: `docker exec -it onboarding_db psql -U admin -d onboarding_dev`

*Check User's Progress:*
```sql
SELECT u.email, m.title, up.status, up.score
FROM users u
JOIN user_progress up ON u.id = up.user_id
JOIN modules m ON up.module_id = m.id
WHERE u.email = 'test@example.com';
```

*Find Orphaned Tasks:*
```sql
SELECT * FROM tasks WHERE module_id IS NULL;
```

## 🐛 5. Debugging Checklist & Pro Tips
- **"CORS Error on Frontend"**: Ensure your `.env` frontend URL matches your backend allowed origins perfectly (watch out for trailing slashes!).
- **"Database Timeout"**: Did you forget to close a transaction? Always use standard pool queries or `COMMIT/ROLLBACK` blocks.
- **"React Query Not Overwriting Cache"**: Pass the exact query key array. `['user', 1]` is strictly different from `['user', "1"]`.
- **Pro Tip**: Use React Query DevTools (flower icon in bottom left of dev build) to inspect exactly what network requests are cached.

## 🧪 6. Testing Patterns
- **Unit logic / Utilities**: Jest (`npm run test:unit`)
- **React Components**: React Testing Library (`npm run test:components`)
- **API Endpoints**: Supertest + Jest (`npm run test:api`)

*Code Coverage Requirement:* CI will fail if PR coverage drops below 80%. Run `npm run test:coverage` locally before committing.
