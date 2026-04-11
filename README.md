# Gemini Express TMS — Developer Setup Guide

> **Stack:** Node.js 20 · pnpm 9 · Turborepo · NestJS · React 18 · PostgreSQL 16 · Redis 7 · Docker · AWS  
> **OS:** Windows (PowerShell)  
> **Repo:** monorepo at `gemini-express-tms/`

---

## PART 1 — Install Prerequisites

Follow these steps **in order**. Each tool is required before the next.

---

### Step 1 — Install nvm-windows (Node Version Manager)

nvm-windows lets you install and switch Node.js versions cleanly.

1. Go to: https://github.com/coreybutler/nvm-windows/releases
2. Download `nvm-setup.exe` (latest release)
3. Run the installer — accept all defaults
4. **Close and reopen PowerShell** (required — it refreshes your PATH)
5. Verify installation:

```powershell
nvm version
```
Expected output: `1.x.x`

---

### Step 2 — Install Node.js 20 LTS

```powershell
nvm install 20
nvm use 20
node --version
```
Expected output: `v20.x.x`

---

### Step 3 — Install pnpm

pnpm is faster and more efficient than npm for monorepos.

```powershell
npm install -g pnpm@9
pnpm --version
```
Expected output: `9.x.x`

---

### Step 4 — Install Git

1. Go to: https://git-scm.com/download/win
2. Download and run the installer
3. During install, choose: **"Use Git from PowerShell"**
4. Verify:

```powershell
git --version
```

---

### Step 5 — Install Docker Desktop

Docker runs PostgreSQL and Redis locally — no manual DB install needed.

1. Go to: https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Windows
3. Install and **restart your computer**
4. Open Docker Desktop — wait for it to show "Engine running"
5. Verify:

```powershell
docker --version
docker compose version
```

---

### Step 6 — Install VS Code + Extensions

1. Go to: https://code.visualstudio.com/
2. Download and install VS Code

Then install these extensions (press `Ctrl+Shift+X` and search each):

| Extension | Why |
|-----------|-----|
| **Prisma** | Schema syntax highlighting + formatting |
| **ESLint** | Live linting in editor |
| **Prettier** | Auto-format on save |
| **Tailwind CSS IntelliSense** | Autocomplete for Tailwind classes |
| **REST Client** | Test API endpoints from `.http` files |
| **GitLens** | Better Git history UI |
| **Docker** | Manage containers from VS Code |

**Recommended VS Code settings** — create `.vscode/settings.json` in project root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

---

## PART 2 — Project Setup

### Step 7 — Clone / Initialize the Repository

If starting fresh (no GitHub repo yet):

```powershell
# Navigate to where you keep projects, e.g.:
cd C:\Users\YourName\Projects

# The project folder is already scaffolded — just init git:
cd gemini-express-tms
git init
git add .
git commit -m "feat: initial monorepo scaffold"
```

To create a GitHub repo:
1. Go to https://github.com/new
2. Name it `gemini-express-tms`, set to **Private**
3. Don't initialize with README (you already have one)
4. Run the commands GitHub shows you to push

---

### Step 8 — Install all dependencies

From the project root (`gemini-express-tms/`):

```powershell
pnpm install
```

This installs dependencies for all apps and packages at once. Turborepo handles the linking between them.

---

### Step 9 — Set up environment variables

```powershell
# Copy the example env file
Copy-Item .env.example .env
```

Open `.env` and fill in at minimum:

```
DATABASE_URL="postgresql://gemini_user:gemini_pass@localhost:5432/gemini_express_dev?schema=public"
REDIS_URL=redis://localhost:6379
JWT_SECRET=          ← generate below
JWT_REFRESH_SECRET=  ← generate below
```

**Generate JWT secrets** (run this in PowerShell):

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run it twice — use the first output for `JWT_SECRET`, second for `JWT_REFRESH_SECRET`.

---

### Step 10 — Start the Database and Redis

```powershell
docker compose up -d
```

This starts PostgreSQL on port 5432 and Redis on port 6379 in the background.

Verify they're running:

```powershell
docker compose ps
```

Both services should show status `healthy`.

---

### Step 11 — Set up the Database (Prisma)

```powershell
# Generate the Prisma client from schema.prisma
pnpm db:generate

# Run the first migration (creates all tables)
pnpm db:migrate
```

When prompted for a migration name, type: `init`

Open Prisma Studio to browse your database visually:

```powershell
pnpm db:studio
```

Browser opens at http://localhost:5555

---

### Step 12 — Start the development servers

Open **two PowerShell windows** (or use VS Code's integrated terminal split):

**Terminal 1 — API (NestJS):**
```powershell
pnpm dev:api
```
API runs at: http://localhost:3001/api/v1  
Swagger docs: http://localhost:3001/api/docs

**Terminal 2 — Web (React):**
```powershell
pnpm dev:web
```
Web app runs at: http://localhost:5173

---

## PART 3 — Project Structure Reference

```
gemini-express-tms/
│
├── apps/
│   ├── api/                        # NestJS backend
│   │   ├── prisma/
│   │   │   └── schema.prisma       # ← ALL database tables defined here
│   │   └── src/
│   │       ├── main.ts             # App entry point
│   │       ├── app.module.ts       # Root module
│   │       ├── common/
│   │       │   ├── prisma/         # Database client (PrismaService)
│   │       │   ├── guards/         # JWT auth guard, role guard
│   │       │   ├── decorators/     # @CurrentUser(), @Roles()
│   │       │   ├── filters/        # Global exception filter
│   │       │   └── interceptors/   # Response transform
│   │       └── modules/
│   │           ├── auth/           # Login, logout, refresh token
│   │           ├── users/          # User CRUD
│   │           ├── loads/          # Load management (the core)
│   │           └── drivers/        # Driver management + HOS
│   │
│   ├── web/                        # React dispatcher app
│   │   └── src/
│   │       ├── App.tsx             # Root — handles auth gate
│   │       ├── lib/api.ts          # Axios client with JWT refresh
│   │       ├── stores/
│   │       │   └── auth.store.ts   # Zustand auth state
│   │       ├── types/index.ts      # TypeScript types
│   │       ├── pages/
│   │       │   └── LoginPage.tsx   # ← built
│   │       └── components/
│   │           ├── layout/
│   │           │   └── DashboardLayout.tsx  # ← built
│   │           └── ui/             # Reusable components (next)
│   │
│   └── mobile/                     # React Native driver app (Phase 3)
│
├── packages/
│   └── types/                      # Shared TypeScript types
│
├── docker-compose.yml              # PostgreSQL + Redis for local dev
├── .env.example                    # Copy to .env and fill in
├── turbo.json                      # Build pipeline config
└── pnpm-workspace.yaml             # Monorepo workspace config
```

---

## PART 4 — What's Built vs What's Next

### ✅ Done in this scaffold
- Full monorepo structure (Turborepo + pnpm workspaces)
- NestJS API bootstrapped with Swagger, validation, CORS, rate limiting
- Complete database schema (Users, Drivers, Loads, Stops, Documents, Invoices)
- Prisma ORM wired up
- React app with Vite, Tailwind, TanStack Query, Zustand
- Axios API client with automatic JWT refresh logic
- Auth store (persists login session)
- Login page (UI + mutation)
- Dashboard layout shell with sidebar navigation

### 🔜 Next: Auth Module (Step 2)
- `POST /auth/login` — validates credentials, issues JWT access + refresh token
- `POST /auth/refresh` — issues new access token from refresh token cookie
- `POST /auth/logout` — clears refresh token
- `GET /auth/me` — returns current user
- JWT guard + `@CurrentUser()` decorator for protecting routes
- Role-based access control (`@Roles(UserRole.DISPATCHER)`)

---

## Common Commands

```powershell
pnpm dev              # Start all apps simultaneously
pnpm dev:api          # Start API only
pnpm dev:web          # Start web app only
pnpm build            # Build all apps for production
pnpm db:migrate       # Run new Prisma migrations
pnpm db:studio        # Open Prisma Studio (visual DB browser)
pnpm db:seed          # Seed database with test data
docker compose up -d  # Start PostgreSQL + Redis
docker compose down   # Stop PostgreSQL + Redis
docker compose logs   # View database logs
```

---

## Troubleshooting

**`pnpm: command not found` after install**
→ Close and reopen PowerShell. If still broken: `npm install -g pnpm@9`

**`Cannot connect to Docker daemon`**
→ Open Docker Desktop and wait for the engine to fully start (green icon)

**`P1001: Can't reach database server`**
→ Make sure Docker containers are running: `docker compose up -d`

**Port 5432 already in use**
→ You have another PostgreSQL running. Stop it or change the port in `docker-compose.yml`

**`Module not found: @gemini-express/types`**
→ Run `pnpm install` from the project root to re-link workspace packages
