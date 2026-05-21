# Job Application Tracker — CLAUDE.md

## Project Goal
A production-ready full-stack web application that helps job seekers in Australia
track their job applications, interview rounds, and application outcomes in one place.
Target users: recent graduates and professionals actively job hunting.
Built as a portfolio piece to demonstrate full-stack TypeScript skills to employers.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express (CommonJS) |
| Database | Supabase PostgreSQL (ap-southeast-2 Sydney) |
| Auth | Supabase Auth (JWT tokens) |
| Deployment | Vercel (frontend) + Render (backend) |

## Monorepo Structure
```
job-applicationTS/
├── CLAUDE.md
├── .gitignore                    # covers both frontend/ and backend/
├── frontend/                     # React app (deployed to Vercel)
│   ├── .env                      # VITE_API_URL=http://localhost:3001
│   ├── src/
│   │   ├── api/
│   │   │   ├── config.ts         # BASE_URL = import.meta.env.VITE_API_URL
│   │   │   ├── auth.ts           # login(), register()
│   │   │   └── jobs.ts           # getAllJobs(), getJobById(), createJob(), updateJob(), deleteJob()
│   │   ├── components/
│   │   │   └── ProtectedRoutes.tsx  # checks useAuth() user — redirects to /login if null
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # user, token, login(), logout(), loading
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx     # lists all user jobs, stats, search/filter
│   │   │   ├── AddApplication.tsx
│   │   │   └── ApplicationDetail.tsx  # job details + interview rounds CRUD
│   │   ├── hooks/                # (empty — for future custom hooks)
│   │   └── types/
│   │       └── index.ts          # JobApplication, ApplicationStatus, AuthContextType
│   └── package.json
└── backend/                      # Express API (deployed to Render)
    ├── .env                      # SUPABASE_URL, SUPABASE_SERVICE_KEY, PORT
    ├── config/
    │   └── supabase.js           # createClient(url, key) — imported everywhere
    ├── middleware/
    │   └── auth.js               # requireAuth — reads Bearer token, calls supabase.auth.getUser()
    ├── routes/
    │   ├── auth.js               # POST /register, POST /login
    │   ├── jobs.js               # full CRUD for job_application table
    │   └── status.js             # full CRUD for application_status table
    └── index.js                  # entry point — mounts all routes
```

## Database Schema
```sql
-- Primary jobs table
job_application (
  job_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL DEFAULT auth.uid(),  -- FK to auth.users
  company_name  text NOT NULL,
  role          text NOT NULL,
  status        text NOT NULL,  -- Applied | Interview | Offer | Rejected
  platform      text,           -- LinkedIn | Seek | Indeed | Referral | Other
  notes         text,
  job_url       text,
  date_applied  timestamptz NOT NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
)

-- Interview rounds per job
application_status (
  app_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        uuid NOT NULL,  -- FK to job_application.job_id
  round         text,           -- Phone Screen | Technical | HR | Final | Assessment
  round_status  text,           -- Passed | Failed | Pending | Withdrawn
  notes         text,
  date          text,
  created_at    timestamptz DEFAULT now()
)
```
RLS enabled on both tables. `service_role` key used in backend to bypass RLS.

## API Endpoints
```
Auth (public):
  POST   /api/auth/register     body: { email, password }
  POST   /api/auth/login        body: { email, password }

Jobs (protected — requires Bearer token):
  GET    /api/jobs              returns all jobs for logged-in user
  POST   /api/jobs              body: { company_name, role, status, platform, notes, job_url, date_applied }
  GET    /api/jobs/:id          returns single job
  PUT    /api/jobs/:id          body: { company_name, role, status, notes, ... }
  DELETE /api/jobs/:id

Interview Rounds (protected):
  GET    /api/jobs/:jobId/status
  POST   /api/jobs/:jobId/status   body: { round, round_status, notes, date }
  PUT    /api/jobs/:jobId/status/:id
  DELETE /api/jobs/:jobId/status/:id
```

## TypeScript Rules
- All interfaces live in `frontend/src/types/index.ts` — never define inline
- Supabase column names are snake_case — interface properties must match exactly (e.g. `date_applied` not `dateApplied`)
- Use `Partial<Type>` for form state that starts empty
- Import types with `import type { X } from "../types"` (verbatimModuleSyntax enabled)
- `token` from `useAuth()` is `string | null` — always guard with `if (!token) return` before API calls

## Backend Rules
- CommonJS only — use `require()` not `import`
- Every jobs/status route must have `requireAuth` as second parameter
- `user_id` always comes from `req.user.id` — never trust `req.body.user_id`
- `updated_at` always set by backend: `new Date().toISOString()`
- Supabase query order: `.from().update/delete().eq().eq().select()`

## Frontend Rules
- Hooks always at component top level — never inside `useEffect` or handlers
- `useNavigate` inside component — never at module level
- API base URL via `import.meta.env.VITE_API_URL` (Vite env) — never hardcode localhost
- `navigate` for programmatic redirect, `<Navigate />` for JSX redirect

## Auth Flow
```
Register:  User fills form → POST /api/auth/register → Supabase creates user → redirect to /login
Login:     User fills form → POST /api/auth/login → Supabase returns { user, session }
           → storeLogin(user, session.access_token) → AuthContext stores in state → redirect /dashboard
Protected: Every request includes header: Authorization: Bearer {token}
           → requireAuth middleware → supabase.auth.getUser(token) → attaches req.user → next()
Logout:    logout() in AuthContext → clears user + token state → redirect /login
```

## Current Feature Status
| Feature | Status |
|---------|--------|
| Register / Login | ✅ Complete |
| Protected routing | ✅ Complete |
| Dashboard — list all jobs | ✅ Complete |
| Add new job application | ✅ Complete |
| View job detail | 🔄 In progress |
| Edit job application | ❌ TODO |
| Delete job application | ❌ TODO |
| Interview rounds — view | ❌ TODO |
| Interview rounds — add | ❌ TODO |
| Interview rounds — edit | ❌ TODO |
| Interview rounds — delete | ❌ TODO |
| Search / filter on Dashboard | ❌ TODO |
| Dashboard stats (Applied/Interview/Offer counts) | ❌ TODO |
| Logout button | ❌ TODO |
| Tailwind UI styling (all pages) | ❌ TODO |
| Loading states on all pages | ❌ TODO |
| Error states on all pages | ❌ TODO |
| Deploy backend to Render | ❌ TODO |
| Deploy frontend to Vercel | ❌ TODO |
| CORS configuration for production | ❌ TODO |

## UI Design Goals
- Clean, professional aesthetic suitable for a portfolio piece
- Color scheme: dark sidebar + white content area OR light with accent color
- Dashboard: stats cards at top (total applied, interviews, offers, rejected) + job cards list
- Job cards: company name, role, status badge (color coded), date applied
- Status badges: Applied (blue) | Interview (yellow) | Offer (green) | Rejected (red)
- ApplicationDetail: two sections — job info top, interview rounds timeline below
- Mobile responsive
- Lucide React icons (already popular in React/Tailwind ecosystem)

## Dev Commands
```bash
# Backend (port 3001)
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm run dev

# Both must run simultaneously for full-stack local development
```

## Environment Variables
```bash
# backend/.env
SUPABASE_URL=https://uuhgehlvlbycqsoctkqx.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
PORT=3001

# frontend/.env
VITE_API_URL=http://localhost:3001
```

## Known Issues
- `loading` in AuthContext initialised as `false` to avoid ProtectedRoute deadlock on page load
- Backend response shape: `{ user: data.user, session: data.session }` — frontend accesses `data.user` and `data.session.access_token`
- CORS not yet configured for production URLs

## When Compacting
Always preserve: current feature status table, API endpoints, database schema, TypeScript rules.
