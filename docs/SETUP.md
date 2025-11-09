# Setup Guide

Complete setup instructions for the Claude Meta-Prompting Demo.

## Prerequisites

### Required

- **Node.js** 20+ ([download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)

### Optional

- **uv** for Python automation ([install](https://docs.astral.sh/uv/))
- **GitHub CLI** for issue creation ([install](https://cli.github.com/))
- **Docker** for containerized setup ([install](https://docs.docker.com/get-docker/))

## Installation

### Automatic Setup (Recommended)

```bash
./scripts/setup.sh
```

This script will:
1. Install all npm dependencies
2. Initialize the SQLite database
3. Seed with test data
4. Setup Python automation tools (if uv installed)

### Manual Setup

If you prefer to set up manually:

```bash
# Install dependencies
pnpm install

# Setup backend database
cd apps/backend
pnpm run db:setup
pnpm run db:seed
cd ../..

# Setup Python tools (optional)
cd automation
uv sync
cd ..
```

## Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# Optional: For Python automation
ANTHROPIC_API_KEY=your_key_here
```

### Database

The SQLite database is created at `apps/backend/data.db`.

To reset:

```bash
./scripts/reset.sh
```

## Running the Application

### Development Mode

Start both frontend and backend:

```bash
pnpm dev
```

This runs:
- Backend on http://localhost:3001
- Frontend on http://localhost:3000

### Individual Services

Backend only:

```bash
cd apps/backend
pnpm dev
```

Frontend only:

```bash
cd apps/frontend
pnpm dev
```

### Production Build

```bash
pnpm build
```

Built files:
- Frontend: `apps/frontend/dist/`
- Backend: `apps/backend/dist/`

## Docker Setup

For complete isolation:

```bash
docker-compose up
```

Services:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

## Verification

### Check Backend

```bash
curl http://localhost:3001/api/products
```

Expected: JSON array of 4 products

### Check Frontend

Open http://localhost:3000 in browser.

Expected: Product grid with 4 items

### Check Database

```bash
sqlite3 apps/backend/data.db "SELECT * FROM products;"
```

Expected: 4 rows

## Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are taken:

```bash
# Backend
PORT=3002 pnpm --filter backend dev

# Frontend (update vite.config.ts proxy target)
cd apps/frontend
pnpm dev --port 3005
```

### Database Locked

If you see "database is locked":

```bash
./scripts/reset.sh
```

### Python Dependencies

If `uv run` fails:

```bash
cd automation
uv sync --reinstall
```

### pnpm Not Found

Install pnpm globally:

```bash
npm install -g pnpm
```

Or use npx:

```bash
npx pnpm install
```

## Next Steps

1. Explore the intentional bugs: See [examples/bugs/](../examples/bugs/)
2. Try the meta-prompts: Run `/issue` in Claude Code
3. Test CLI automation: `uv run automation/issue.py "bug description"`
4. Read architecture docs: [ARCHITECTURE.md](ARCHITECTURE.md)

## Uninstallation

```bash
# Remove dependencies
rm -rf node_modules apps/*/node_modules

# Remove database
rm -f apps/backend/data.db

# Remove Python virtual env
rm -rf automation/.venv
```
