# EduPath

EduPath is a full-stack platform that connects students with colleges, job/internship
opportunities, and online classes. Colleges, employers, and instructors list their offerings,
students discover and apply to them, and admins moderate everything through an approval workflow.

## Tech stack

**Frontend** — React 19 (Vite), React Router, Tailwind CSS
**Backend** — Node.js (Express 5), MongoDB (Mongoose), JWT authentication
**Testing** — Node's built-in test runner (`node:test`), Supertest, mongodb-memory-server for integration tests

## Features

- **Auth** — registration, login, JWT sessions, password change/reset
- **Catalog browsing** — search and filter colleges, jobs/internships, and online classes (public, no login required)
- **Student tools** — student profile, CV Maker (multi-template live preview + print-to-PDF), saved items (colleges/jobs/classes), inquiries, job applications, personalized recommendations
- **Partner listings** — college admins list colleges, employers list jobs/internships, instructors list online classes — each goes through an admin approval workflow before appearing publicly
- **Role-based dashboards** — separate dashboards for Admin, Employer, College Admin, and Instructor, each scoped to what that role owns or manages
- **Admin moderation** — approve/reject listings, manage user accounts and roles

### Roles

| Role | Can do |
|---|---|
| `student` | Build a profile/CV, save and apply to listings, send inquiries |
| `college_admin` | Create and manage college listings, view inquiries about their colleges |
| `employer` | Create and manage job/internship listings, review applications |
| `instructor` | Create and manage online class listings, view inquiries about their classes |
| `admin` | Approve/reject any listing, manage all user accounts and roles |

## Project structure

```
EduPath/
├── Backend/
│   ├── app.js                 # Express app (routes, middleware) — imported by tests and index.js
│   ├── index.js                # Server entrypoint: connects DB, starts listening
│   ├── config/                 # DB connection, role definitions
│   ├── controllers/            # Route handlers
│   ├── middleware/              # Auth, authorization, rate limiting, error handling, uploads
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # Express routers, mounted under /api
│   ├── services/                # Business logic (recommendations, filtering, CV export, etc.)
│   ├── validators/              # express-validator request validation chains
│   ├── seeds/ + seed.js         # Seed data for local development
│   └── tests/                   # Unit tests + tests/integration (Supertest + in-memory MongoDB)
└── Frontend/
    ├── src/pages/                # Route-level page components
    ├── src/components/           # Shared UI components
    ├── src/context/              # AuthContext (session state)
    └── src/api/                  # API client + typed endpoint calls
```

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB connection (local instance or a MongoDB Atlas cluster)

### Backend setup

cd Backend
```bash
npm install
cp  .env   # then fill in MONGODB_URI, JWT_SECRET, etc.
npm run seed            # optional: populate sample colleges/jobs/classes/users
npm run dev              # starts the API on http://localhost:3000
```

### Frontend setup

```bash
cd Frontend
npm install
cp .env.example .env.local  
npm run dev                   
```

## Available scripts

**Backend** (`Backend/package.json`)
| Script | Description |
|---|---|
| `npm run dev` | Start the API with nodemon (auto-restart) |
| `npm start` | Start the API |
| `npm run seed` | Populate the database with sample data |
| `npm test` | Run the test suite (unit + integration) |

**Frontend** (`Frontend/package.json`)
| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview a production build locally |
| `npm run lint` | Run ESLint |

## Testing

The backend test suite (`Backend/tests/`) uses Node's built-in test runner:

- **Unit tests** — validators, query/filter builders, recommendation scoring, response utilities — run with no database required.
- **Integration tests** (`Backend/tests/integration/`) — spin up an isolated in-memory MongoDB (via `mongodb-memory-server`) and drive the real Express app with Supertest, covering auth, CRUD + ownership/role authorization for colleges/opportunities/classes, profile and saved-item routes, and inquiries/applications.

Run everything with:

```bash
cd Backend
npm test
```
