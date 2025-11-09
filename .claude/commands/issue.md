# /issue - Create Implementation-Ready Issue

Create a structured GitHub issue with complete context for downstream implementation.

## Process

1. **Repository State Check**
   - Run `git fetch --all --prune` (if remote exists)
   - Run `git status` - abort if working tree is dirty

2. **Duplicate Check**
   - Run `gh issue list --search "<keywords>" --state all`
   - If similar issue exists, ask user if they want to update it instead

3. **Context Gathering** (CRITICAL STEP)

   a) **Search Codebase**
   - Frontend: `apps/frontend/src/**/*.{ts,tsx}`
   - Backend: `apps/backend/src/**/*.ts`
   - Focus on files related to: cart, order, payment, webhook based on issue description

   b) **Check Recent Changes**
   - Run `git log --oneline -20 -- <affected-paths>`
   - Identify recent work that might be related

   c) **Map Dependencies**
   - For cart issues: check cartStore.ts, cart.service.ts, Cart.tsx
   - For order issues: check OrderStatus.tsx, order.service.ts, orders.ts route
   - For payment issues: check payment.ts webhook, order.service.ts

   d) **Review Architecture Docs**
   - Read `.claude/commands/docs/architecture.md`
   - Read `.claude/commands/docs/state-management.md` if frontend issue
   - Read `.claude/commands/docs/api-routes.md` if backend issue

4. **Root Cause Analysis**
   - Trace data flow through the stack
   - Identify where behavior diverges from expected
   - Check for timing issues, missing handlers, state sync problems
   - Review relevant bug documentation in `examples/bugs/` if available

5. **Solution Design**
   - List affected files with line ranges
   - Describe implementation approach
   - Define test strategy
   - Note any constraints or gotchas

6. **Create Issue**
   ```bash
   gh issue create \
     --title "<conventional-commit-title>" \
     --body-file /tmp/issue-body.md \
     --label "bug" \
     --label "<component:frontend|backend|fullstack>"
   ```

7. **Output Structured JSON**
   See schema below.

## Output Schema

```json
{
  "type": "object",
  "properties": {
    "issue_number": {"type": "number"},
    "title": {"type": "string"},
    "summary": {"type": "string", "description": "2-3 sentence explanation"},
    "root_cause": {"type": "string", "description": "Technical explanation of the bug"},
    "affected_files": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "path": {"type": "string"},
          "reason": {"type": "string"},
          "line_range": {"type": "string", "description": "e.g., '45-67' or 'entire file'"}
        },
        "required": ["path", "reason"]
      }
    },
    "implementation_approach": {"type": "string"},
    "test_strategy": {"type": "string"},
    "constraints": {
      "type": "array",
      "items": {"type": "string"}
    }
  },
  "required": ["issue_number", "title", "summary", "root_cause", "affected_files", "implementation_approach"]
}
```

## Example Output

```json
{
  "issue_number": 42,
  "title": "fix: payment webhook not updating order status",
  "summary": "Orders remain in 'processing' state indefinitely after successful payment. The webhook handler exists but is not registered with Express routing.",
  "root_cause": "The payment webhook handler in apps/backend/src/webhooks/payment.ts is implemented but never imported or registered in server.ts. When Stripe (simulated) sends payment.succeeded events, they hit a 404.",
  "affected_files": [
    {
      "path": "apps/backend/src/server.ts",
      "reason": "Missing webhook route registration",
      "line_range": "15-25"
    },
    {
      "path": "apps/backend/src/webhooks/payment.ts",
      "reason": "Webhook handler implementation (correct, just not wired up)",
      "line_range": "entire file"
    },
    {
      "path": "apps/backend/src/services/order.service.ts",
      "reason": "Order status update logic that webhook should trigger",
      "line_range": "34-56"
    }
  ],
  "implementation_approach": "1. Import payment webhook router in server.ts. 2. Register route at /api/webhooks/payment. 3. Ensure proper error handling for invalid webhook payloads.",
  "test_strategy": "1. Unit test: Mock webhook payload to order service. 2. Integration test: POST to /api/webhooks/payment, verify order status updates. 3. Manual test: Create order, simulate webhook, check status on frontend.",
  "constraints": [
    "Must validate webhook signature in production (not required for demo)",
    "Should handle idempotent webhook delivery",
    "Frontend polling should pick up status change within 2 seconds"
  ]
}
```
