# JobTracker — Job Application Tracker

A full-stack web application to help job seekers track their applications, interview rounds, and outcomes in one organised place.

Built as a portfolio project to demonstrate full-stack TypeScript skills — React frontend, Node.js/Express backend, and Supabase PostgreSQL database.

🔗 **Live Demo:**

---

## Screenshots

> 

---

## Features

- **Authentication** — Secure register and login via Supabase Auth (JWT)
- **Dashboard** — View all job applications with stats (Applied, Interview, Offer, Rejected)
- **Search & Filter** — Search by company name, filter by application status
- **Add Application** — Log new job applications with company, role, status, platform, date and notes
- **Application Detail** — View full job details and manage interview rounds
- **Interview Rounds** — Add, edit and delete interview rounds per application
- **Edit & Delete** — Update or remove any job application
- **Persistent Auth** — Stay logged in across page refreshes via localStorage
- **Protected Routes** — All dashboard pages require authentication
- **Responsive UI** — Mobile-friendly design with Tailwind CSS

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI framework with type safety |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing |
| Context API | Global auth state management |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| Supabase JS Client | Database queries |
| Supabase Auth | JWT token verification |
| CORS | Cross-origin request handling |

### Database & Hosting
| Service | Purpose |
|---------|---------|
| Supabase PostgreSQL | Database (ap-southeast-2 Sydney) |
| Vercel | Frontend deployment |
| Render | Backend deployment |

---

## Architecture

```
React Frontend (Vercel)
        ↓ HTTP + Bearer Token
Express Backend (Render)
        ↓ Supabase Client
Supabase PostgreSQL (Sydney)
```

Every API request from the frontend includes a JWT token in the `Authorization` header. The Express backend verifies it via Supabase Auth before allowing access to any data.

---

## Database Schema

```sql
-- Job Applications
job_application (
  job_id        uuid PRIMARY KEY,
  user_id       uuid NOT NULL,       -- FK to auth.users
  company_name  text NOT NULL,
  role          text NOT NULL,
  status        text NOT NULL,       -- Applied | Interview | Offer | Rejected
  platform      text,                -- LinkedIn | Seek | Indeed | Referral
  notes         text,
  job_url       text,
  date_applied  timestamptz NOT NULL,
  created_at    timestamptz,
  updated_at    timestamptz
)

-- Interview Rounds
application_status (
  app_id        uuid PRIMARY KEY,
  job_id        uuid NOT NULL,       -- FK to job_application
  round         text,                -- Phone Screen | Technical | HR | Final
  round_status  text,               -- Passed | Failed | Pending
  notes         text,
  date          text,
  created_at    timestamptz
)
```

---

## API Endpoints

```
Auth
  POST   /api/auth/register
  POST   /api/auth/login

Jobs (protected)
  GET    /api/jobs
  POST   /api/jobs
  GET    /api/jobs/:id
  PUT    /api/jobs/:id
  DELETE /api/jobs/:id

Interview Rounds (protected)
  GET    /api/jobs/:jobId/status
  POST   /api/jobs/:jobId/status
  PUT    /api/jobs/:jobId/status/:id
  DELETE /api/jobs/:jobId/status/:id
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/bibekkunwar/job-applicationTS.git
cd job-applicationTS
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_service_role_key
PORT=3001
```

```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:3001
```

```bash
npm run dev
```

### 4. Open the app
Visit `http://localhost:5173`

---

## Project Structure

```
job-applicationTS/
├── frontend/
│   └── src/
│       ├── api/          # fetch calls to backend
│       ├── components/   # ProtectedRoutes
│       ├── context/      # AuthContext
│       ├── pages/        # Login, Register, Dashboard, etc.
│       └── types/        # TypeScript interfaces
└── backend/
    ├── config/           # Supabase client
    ├── middleware/       # JWT auth middleware
    ├── routes/           # auth, jobs, status
    └── index.js          # Express entry point
```

---

## What I Learned

- Building a full-stack TypeScript application from scratch
- JWT authentication flow with Supabase Auth
- Express middleware pattern for protected routes
- React Context API for global state management
- TypeScript interfaces and type safety across a real project
- Deploying a monorepo to separate hosting platforms

---

## Author

**Bibek Kunwar**
Sydney, NSW Australia
[Portfolio](https://bibekportfolio-github-io.vercel.app) · [LinkedIn](https://linkedin.com/in/bibekkunwar) · [GitHub](https://github.com/bibekkunwar)
