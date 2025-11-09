# Video Production Notes

Notes for creating the YouTube video tutorial.

## Video Outline (10-15 minutes)

### 1. Introduction (1 min)
- Hook: "AI can write code, but can it debug YOUR code?"
- Show broken app (order stuck in "processing")
- Promise: By the end, you'll see AI trace bugs through a full stack

### 2. The Problem (2 min)
- Demo the broken application
  - Add items to cart
  - Place order
  - Status never updates from "processing"
- Traditional debugging approach:
  - Search logs
  - Add console.logs
  - Check network tab
  - Trace through multiple files
- **This could take 30+ minutes**

### 3. The Meta-Prompt Solution (4 min)
- Open Claude Code
- Type: `/issue fix payment webhook not updating order status`
- Show the agent:
  - Searching codebase
  - Reading architecture docs
  - Tracing data flow
  - Identifying root cause
- **Output: Structured issue in 2 minutes**
- Highlight JSON output:
  - Affected files with line numbers
  - Root cause explanation
  - Fix approach
  - Test strategy

### 4. How It Works (4 min)

**Show the meta-prompt structure**:

```markdown
1. Repository state check
2. Duplicate check
3. Context gathering ← THE MAGIC
   - Search codebase
   - Check recent changes
   - Map dependencies
   - Review architecture docs
4. Root cause analysis
5. Solution design
6. Output structured JSON
```

**Key insight**: The meta-prompt is a debugging recipe.

**Show the context sources**:
- `.claude/commands/docs/architecture.md` - System overview
- `examples/bugs/` - Similar bugs
- Well-structured code - Easy to parse

### 5. CLI Automation Demo (2 min)

Show the same thing via CLI:

```bash
uv run automation/issue.py "fix payment webhook"
```

- Same meta-prompt
- Same output
- **Now it's scriptable**

Use cases:
- CI/CD pipelines
- Batch bug analysis
- Automated code review

### 6. Implementing the Fix (2 min)

Show the actual fix:

```diff
// apps/backend/src/server.ts

+ import paymentWebhook from './webhooks/payment.js';

  app.use('/api/products', productsRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/orders', ordersRouter);
+ app.use('/api/webhooks', paymentWebhook);
```

- Restart server
- Place new order
- Simulate webhook:
  ```bash
  curl -X POST http://localhost:3001/api/webhooks/payment \
    -H "Content-Type: application/json" \
    -d '{"eventType":"payment.succeeded","paymentIntentId":"pi_xxx","amount":10000,"timestamp":"2024-01-01T00:00:00.000Z"}'
  ```
- **Order status updates to "completed"!**

### 7. Outro (1 min)

**Key takeaways**:
1. Meta-prompts are debugging recipes for AI
2. Context engineering makes AI smarter
3. Same prompts work in-editor and as CLI automation

**Call to action**:
- Clone the repo (link in description)
- Try the other 3 bugs
- Adapt the meta-prompts for your codebase

## Visual Elements

### B-Roll Footage
- Code editor with meta-prompt running
- Terminal showing CLI automation
- Browser showing broken app → fixed app
- File tree highlighting affected files

### Graphics to Create
- Diagram: Traditional debugging workflow (complex, many arrows)
- Diagram: Meta-prompt workflow (linear, simple)
- Infographic: 4 intentional bugs
- Schema: JSON output structure

### Screen Recordings Needed
1. Broken app demo (place order, status stuck)
2. Claude Code running `/issue` command
3. CLI automation running
4. Implementing the fix
5. Fixed app demo (order completes)

## Script Outline

### Hook (0:00 - 0:15)
```
"You've probably seen AI write code from scratch.
But can it debug YOUR code?
Watch this..."
[Show order stuck in processing]
```

### Setup (0:15 - 0:45)
```
"This is a simple e-commerce app.
Frontend talks to backend, backend updates database.
But something's broken.
Orders get stuck in 'processing' forever.
Let's see if AI can find the bug."
```

### Demo (0:45 - 2:30)
```
"I'm going to use a meta-prompt - think of it like
a debugging recipe I wrote for Claude.
Watch what happens when I type '/issue'..."
[Show agent working]
"It's searching the codebase...
Reading the architecture docs...
Tracing the data flow...
And in less than 2 minutes..."
[Show JSON output]
```

### Explanation (2:30 - 5:00)
```
"How did it do this?
The meta-prompt follows a structured process..."
[Show the 6 steps]
"The magic is in step 3: Context Gathering.
It doesn't search randomly - it knows WHERE to look."
[Show architecture docs, bug examples]
```

### Automation (5:00 - 6:30)
```
"Here's the cool part.
This same meta-prompt works from the command line."
[Show CLI demo]
"Now I can script this.
Imagine running this in CI/CD...
Or analyzing 100 bugs at once."
```

### Fix (6:30 - 8:00)
```
"Let's verify the AI was right.
According to the output, I need to uncomment
these two lines in server.ts..."
[Show the fix]
"Restart the server...
Simulate a payment webhook...
And boom - order status updates!"
```

### Conclusion (8:00 - 9:00)
```
"Three key ideas:
1. Meta-prompts turn AI into a reliable debugging tool
2. Context engineering - architecture docs, examples - makes AI way smarter
3. The same prompts work in-editor AND as automation

The repo is linked below.
It has 4 intentional bugs for you to practice with.
Try adapting the meta-prompts to YOUR codebase.

Questions? Drop them in the comments.
Happy debugging!"
```

## Thumbnail Ideas

- Split screen: Confused developer vs. Claude analyzing code
- Before/After: Complex debugging flow chart vs. simple meta-prompt
- Text overlay: "AI Debugs a Full Stack in 2 Minutes"

## YouTube Description

```
🤖 Can AI debug a full-stack application? Watch Claude Code trace a payment webhook bug through frontend, backend, and database using meta-prompts.

📦 Clone the repo: [link]

⏱️ Timestamps:
0:00 - The broken app
0:45 - Meta-prompt in action
2:30 - How it works
5:00 - CLI automation
6:30 - Implementing the fix
8:00 - Key takeaways

🛠️ Tools used:
- Claude Code
- TypeScript full-stack
- Custom meta-prompts

🎓 What you'll learn:
- Context engineering for AI
- Meta-prompting patterns
- Automated code analysis
- Full-stack debugging with AI

🔗 Links:
- GitHub repo: [link]
- Claude Code: https://claude.com/code
- Meta-prompting guide: [link]

#AI #Debugging #ClaudeCode #TypeScript #FullStack
```

## Notes for Editing

- **Pace**: Keep it fast. Cut dead air.
- **Captions**: Show code snippets on screen when mentioning files
- **Zoom**: Zoom into relevant code sections
- **Highlights**: Use arrows/boxes to point out key lines
- **Music**: Light background music, not distracting
- **Transitions**: Quick cuts, no fancy effects

## Equipment Checklist

- [ ] Screen recording software (OBS, ScreenFlow)
- [ ] Microphone (good audio is critical)
- [ ] Code editor theme (high contrast for recording)
- [ ] Terminal theme (readable font, high contrast)
- [ ] Demo database with test data
- [ ] Backup recording of all demos (in case live demo fails)

## Post-Production

- [ ] Color correction for screen recordings
- [ ] Audio leveling
- [ ] Add captions for code snippets
- [ ] Add timestamps in description
- [ ] Create 3 thumbnail variants for A/B testing
- [ ] Write engaging title (< 60 chars)
- [ ] Add cards pointing to related videos
- [ ] Pin comment with repo link
