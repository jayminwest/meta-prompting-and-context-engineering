# Video Recording Checklist

Quick reference for recording the demo video.

## Before Recording

### 1. Environment Setup
- [ ] Terminal: High contrast theme, readable font (16-18pt)
- [ ] Editor: Clean workspace, no sensitive info visible
- [ ] Browser: Clear cookies/cache, prepare demo user account
- [ ] Audio: Test microphone levels
- [ ] Screen: 1920x1080 or 2560x1440 resolution
- [ ] Close: Slack, email, notifications

### 2. Application Setup
```bash
# Clean slate
./scripts/reset.sh

# Start fresh
pnpm dev

# Open browser to http://localhost:3000
# Verify all 4 products load
```

### 3. For Manual Issue Creation (Optional)

If you want to show a REAL GitHub issue being created during recording:

1. Temporarily enable issue creation:
   ```bash
   # Edit .claude/commands/issue.md
   # Change step 6 from "SKIP THIS STEP" to run the actual command
   ```

2. Authenticate GitHub CLI:
   ```bash
   gh auth login
   gh auth status
   ```

3. After recording, revert the change:
   ```bash
   git checkout .claude/commands/issue.md
   ```

## Recording Segments

### Segment 1: The Broken App (2 min)

**Script**: "Let me show you a bug in this e-commerce app..."

```bash
# Terminal 1: Start backend
cd apps/backend && pnpm dev

# Terminal 2: Start frontend
cd apps/frontend && pnpm dev

# Browser: http://localhost:3000
```

**Demo**:
1. Add "Wireless Keyboard" to cart
2. Click cart, verify item appears
3. Click "Checkout"
4. Note the order ID and status: "processing"
5. Wait 10 seconds...
6. Refresh page
7. **Bug**: Status still shows "processing"

**Highlight**: "In a real app, this would update to 'completed' after payment succeeds. But it's stuck."

---

### Segment 2: Traditional Debugging (1 min)

**Script**: "Normally, I'd have to..."

Show (but don't actually do):
- Open DevTools Network tab
- Check API calls
- Look at console logs
- Search codebase for "webhook"
- Trace through 3-4 files
- Spend 20-30 minutes

**Transition**: "But watch what happens with a meta-prompt..."

---

### Segment 3: Meta-Prompt in Action (3 min)

**Script**: "I'll use a meta-prompt I wrote. It's like a debugging recipe for Claude."

```bash
# In Claude Code editor
/issue fix payment webhook not updating order status
```

**Voiceover while agent runs**:
- "It's searching the codebase..."
- "Reading the architecture docs..."
- "Tracing the data flow..."
- "And in under 2 minutes..."

**Show the JSON output**:
```json
{
  "issue_number": 1,
  "title": "fix: payment webhook not updating order status",
  "root_cause": "Webhook handler not registered in server.ts",
  "affected_files": [...]
}
```

**Highlight**:
- Point to `affected_files` with line numbers
- Point to `implementation_approach`
- Point to `test_strategy`

---

### Segment 4: How It Works (3 min)

**Script**: "Let me show you the meta-prompt itself..."

Open `.claude/commands/issue.md`

**Walk through the process**:
1. Repository state check
2. Duplicate check
3. **Context gathering** ← zoom in here
4. Root cause analysis
5. Solution design
6. Output structured JSON

**Show context sources**:
```bash
# Open in split view
.claude/commands/docs/architecture.md
.claude/commands/docs/api-routes.md
examples/bugs/01-payment-webhook.md
```

**Key point**: "The meta-prompt knows WHERE to look because we gave it a map of the codebase."

---

### Segment 5: CLI Automation (2 min)

**Script**: "Same meta-prompt, but scriptable..."

```bash
uv run automation/issue.py "fix payment webhook not updating order status"
```

**Show streaming output**

**Show saved JSON**:
```bash
cat .claude/state/last_issue.json | jq
```

**Use cases**:
- CI/CD pipelines
- Batch bug analysis
- Automated code review
- Nightly builds

---

### Segment 6: Implementing the Fix (2 min)

**Script**: "Let's verify the AI was right..."

Open `apps/backend/src/server.ts`

**Show the bug** (lines 5-6, 18-19):
```typescript
// import paymentWebhook from './webhooks/payment.js';  // <-- COMMENTED
// ...
// app.use('/api/webhooks', paymentWebhook);  // <-- NOT REGISTERED
```

**Uncomment both lines**

**Restart backend**:
```bash
# Ctrl+C in backend terminal
pnpm dev
```

**Test the fix**:
```bash
# Create new order (browser)
# Note the payment_intent_id from DevTools

# Simulate webhook
curl -X POST http://localhost:3001/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "payment.succeeded",
    "paymentIntentId": "pi_YOUR_ACTUAL_ID_HERE",
    "amount": 10000,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }'

# Refresh order page
# Status updates to "completed"! ✅
```

**Celebrate**: "The AI was exactly right!"

---

### Segment 7: Wrap Up (1 min)

**Script**: "Three key takeaways..."

1. **Meta-prompts are debugging recipes**
   - Structured process
   - Repeatable results
   - Works across codebases

2. **Context engineering makes AI smarter**
   - Architecture docs
   - Example bugs
   - Well-structured code

3. **Same prompts work everywhere**
   - In-editor (Claude Code)
   - CLI automation
   - CI/CD pipelines

**Call to action**:
- "Clone the repo (link below)"
- "Try the other 3 bugs"
- "Adapt the meta-prompts for YOUR codebase"

**End screen**:
- GitHub repo link
- Subscribe button
- Next video teaser

---

## B-Roll to Capture

Record these separately for editing:

- [ ] Clean code editor with syntax highlighting
- [ ] Terminal running commands (no errors)
- [ ] Browser showing working app → broken app → fixed app
- [ ] File tree showing project structure
- [ ] Meta-prompt file with syntax highlighting
- [ ] JSON output with pretty colors
- [ ] Architecture diagrams (create in Excalidraw?)

---

## Common Issues During Recording

### Port already in use
```bash
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill
```

### Database locked
```bash
./scripts/reset.sh
```

### Need to restart demo
```bash
git checkout .  # Revert all changes
./scripts/reset.sh
pnpm dev
```

### Simulation webhook fails
Make sure to use the ACTUAL `paymentIntentId` from the order.
Check: `sqlite3 apps/backend/data.db "SELECT * FROM orders"`

---

## Post-Recording Checklist

- [ ] Revert temporary issue creation enablement (if used)
- [ ] Review footage for sensitive info (API keys, etc.)
- [ ] Check audio levels
- [ ] Verify all commands visible on screen
- [ ] Test video on different screen sizes
- [ ] Add timestamps to YouTube description
- [ ] Create 3 thumbnail variants
- [ ] Write engaging title (< 60 chars)

---

## Backup Plan

If live demo fails during recording:

1. Use pre-recorded segments
2. Show static JSON output from `examples/outputs/`
3. Walk through code changes manually
4. Focus on explaining concepts over live demo

**Remember**: A clear explanation > perfect demo
