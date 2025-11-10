# Claude Code Meta-Prompting Demo

A minimal e-commerce cart application designed to demonstrate context engineering and meta-prompting patterns for Claude Code. The codebase intentionally contains well-documented bugs that showcase how meta-prompts research, analyze, and generate implementation-ready issues.

**Target audience**: Developers learning AI-augmented development
**Setup time**: < 5 minutes from clone to running
**Tech stack**: TypeScript full-stack (simplicity over production patterns)

## 🎥 Video Tutorial

[Link to video will be embedded here]

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd meta-prompting-and-context-engineering

# Use the recommended Node.js version (22 LTS)
# If using nvm: nvm use
# If using fnm: fnm use
# Otherwise install Node.js 22 from nodejs.org

# (Optional) Configure environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY for Python automation

# Install dependencies and setup database
pnpm install
cd apps/backend
pnpm db:setup    # Initialize database schema
pnpm db:seed     # Add sample products
cd ../..

# Start development servers
pnpm dev
```

Open http://localhost:3000 to see the application.

**Important**: The database must be initialized before starting the dev server, or you'll see "no such table: products" errors.

## 📋 Features

- **Product Catalog**: Browse products with prices and stock info
- **Shopping Cart**: Add/remove items, update quantities
- **Order Processing**: Place orders and track payment status
- **Payment Webhooks**: Simulated payment processing (like Stripe)

## 🐛 Intentional Bugs

This demo contains **4 intentional bugs** designed to demonstrate meta-prompting capabilities:

1. **Payment Webhook Not Registered** - Orders stuck in "processing" state
2. **Cart Race Condition** - Concurrent updates overwrite each other
3. **Order Status Not Polling** - Frontend doesn't update when payment completes
4. **Cart Total Calculation** - Total excludes most recently added item

See [`examples/bugs/`](examples/bugs/) for detailed documentation of each bug.

## 🤖 Meta-Prompting Demo

### Using Claude Code (In-Editor)

```
/issue fix payment webhook not updating order status
```

The meta-prompt will:
1. Search the codebase for relevant files
2. Trace data flow through the stack
3. Identify root cause
4. Generate structured issue with fix approach

### Using CLI Automation

```bash
uv run automation/issue.py "fix payment webhook not updating order status"
```

This generates a JSON analysis (always) and optionally creates a GitHub issue.

Output saved to `.claude/state/last_issue.json`:

```json
{
  "title": "fix: payment webhook not updating order status",
  "root_cause": "Webhook handler not registered in server.ts",
  "affected_files": [...],
  "implementation_approach": "...",
  "test_strategy": "..."
}
```

**Optional: Create GitHub Issues**

To automatically create GitHub issues, set in your `.env`:

```bash
CREATE_GITHUB_ISSUES=true
```

Requires `gh` CLI installed and authenticated. By default, only JSON output is generated (no GitHub issues created).

## 🏗️ Architecture

### Stack

- **Frontend**: Vite + React 18 + TypeScript + Zustand + TanStack Query
- **Backend**: Express + TypeScript + SQLite (better-sqlite3)
- **Tooling**: pnpm workspaces, tsx, uv (Python)

### Project Structure

```
├── apps/
│   ├── frontend/          # Vite React app
│   │   └── src/
│   │       ├── api/       # API client
│   │       ├── store/     # Zustand state
│   │       ├── hooks/     # React Query hooks
│   │       ├── components/
│   │       └── pages/
│   └── backend/           # Express API
│       └── src/
│           ├── routes/    # REST endpoints
│           ├── services/  # Business logic
│           └── webhooks/  # Payment webhooks
├── .claude/
│   └── commands/
│       ├── issue.md       # Meta-prompt for issues
│       └── docs/          # Architecture docs
├── automation/            # Python CLI tools
│   ├── issue.py          # GitHub issue creator
│   └── lib/
└── examples/
    ├── bugs/             # Bug documentation
    └── outputs/          # Example outputs
```

### Data Flow

1. **Add to Cart**: Frontend → POST `/api/cart/:id/items` → SQLite → Zustand
2. **Place Order**: Frontend → POST `/api/orders` → Create order in "processing"
3. **Payment Webhook**: Stripe → POST `/api/webhooks/payment` → Update status
4. **Status Polling**: Frontend polls `/api/orders/:id` every 2s

## 📚 Documentation

- [SETUP.md](docs/SETUP.md) - Detailed setup instructions
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design deep-dive
- [VIDEO_NOTES.md](docs/VIDEO_NOTES.md) - Notes for video production

## 🧪 Testing the Bugs

### Bug 1: Payment Webhook

```bash
# Place an order, then simulate webhook
curl -X POST http://localhost:3001/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "payment.succeeded",
    "paymentIntentId": "YOUR_PAYMENT_INTENT_ID",
    "amount": 10000,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }'

# Expected: 404 (bug)
# After fix: 200 + order status updates
```

### Bug 2: Race Condition

```javascript
// In browser DevTools
const cartId = localStorage.getItem('cart-storage');
Promise.all([
  fetch(`/api/cart/${cartId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: 1, quantity: 1 })
  }),
  fetch(`/api/cart/${cartId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: 2, quantity: 1 })
  })
]);

// Expected: Both items in cart
// Bug: Only one item appears
```

### Bug 3: Order Status Polling

1. Place order
2. Manually update database: `sqlite3 apps/backend/data.db "UPDATE orders SET status='completed' WHERE id='ORDER_ID'"`
3. Wait 30 seconds
4. Bug: UI still shows "processing" (no polling)

### Bug 4: Cart Total

1. Add item A ($79.99)
2. Check total: Shows $0.00 (bug)
3. Add item B ($49.99)
4. Check total: Shows $79.99 (missing item B)
5. Refresh page
6. Total corrects to $129.98

## 🔧 Development

### Scripts

```bash
pnpm dev          # Start frontend + backend
pnpm build        # Build both apps
pnpm reset        # Reset database
```

### Backend

```bash
cd apps/backend
pnpm dev          # Start on port 3001
pnpm db:setup     # Initialize database
pnpm db:seed      # Add test data
```

### Frontend

```bash
cd apps/frontend
pnpm dev          # Start on port 3000
pnpm build        # Production build
```

## 🐍 Python Automation

Requires [uv](https://docs.astral.sh/uv/):

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Setup automation tools
cd automation
uv sync

# Set API key
export ANTHROPIC_API_KEY=your_key_here

# Run issue creator
uv run automation/issue.py "fix payment webhook"
```

See [automation/README.md](automation/README.md) for details.

## 🎯 Learning Objectives

This demo teaches:

1. **Context Engineering**: How to structure codebases for AI analysis
2. **Meta-Prompting**: Writing prompts that generate structured outputs
3. **Codebase Navigation**: How AI agents search and understand code
4. **Root Cause Analysis**: Tracing bugs through multiple layers
5. **Automation Patterns**: CLI tools for CI/CD integration

## 🛠️ Key Techniques

### 1. Structured Meta-Prompts

The `/issue` command follows a strict process:
- Repository state checks
- Codebase search with focused scope
- Dependency mapping
- Root cause analysis
- Structured JSON output

### 2. Documentation as Context

The `.claude/commands/docs/` directory provides:
- Architecture overview
- State management patterns
- API route reference

AI agents read these to understand the system before analyzing bugs.

### 3. Example-Driven Learning

Each bug in `examples/bugs/` includes:
- Reproduction steps
- Root cause explanation
- Affected files with line ranges
- Fix approach
- Test strategy

This teaches the meta-prompt what "good output" looks like.

### 4. CLI Automation

Python scripts demonstrate:
- Loading meta-prompts programmatically
- Streaming AI responses
- Parsing structured outputs
- Saving state for command chaining

## 📊 Success Criteria

- ✅ Clone to running app in < 5 minutes
- ✅ All 4 bugs are reproducible
- ✅ Meta-prompt generates structured output
- ✅ CLI automation produces identical results
- ✅ Documentation is clear and complete

## 🤝 Contributing

This is a demo repository. Feel free to:
- Fork and modify for your own demos
- Add new intentional bugs
- Improve meta-prompts
- Extend automation scripts

## 📝 License

MIT

## 🙏 Acknowledgments

Built to demonstrate Claude Code meta-prompting patterns. Inspired by real-world debugging workflows and AI-augmented development practices.

---

**Questions?** Open an issue or check the [video tutorial](#-video-tutorial).
