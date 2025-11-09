# Claude Automation Scripts

Python-based CLI tools for programmatic execution of Claude Code meta-prompts.

## Setup

Requires [uv](https://docs.astral.sh/uv/) for dependency management:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Install dependencies:

```bash
cd automation
uv sync
```

Set your API key:

```bash
export ANTHROPIC_API_KEY=your_key_here
```

## Usage

### Create GitHub Issue

```bash
uv run automation/issue.py "fix payment webhook not updating order status"
```

This will:
1. Load the `/issue` meta-prompt from `.claude/commands/issue.md`
2. Execute it via Claude API
3. Parse the structured JSON output
4. Save results to `.claude/state/last_issue.json`

### Example Output

```
Creating issue: fix payment webhook not updating order status

--- Agent Output ---
[Claude's research and analysis appears here...]
--- End Output ---

┌─ Success ─────────────────────────────────┐
│ ✓ Issue #1 created                        │
│                                            │
│ Title: fix: payment webhook not updating  │
│ Summary: Orders remain in 'processing'... │
│ Affected Files: 3 files                   │
└────────────────────────────────────────────┘

Structured output saved to .claude/state/last_issue.json
View issue: gh issue view 1
```

## How It Works

The automation scripts demonstrate how to:

1. **Load meta-prompts** from `.claude/commands/`
2. **Execute them programmatically** using Anthropic API
3. **Parse structured outputs** (JSON, markdown, etc.)
4. **Chain commands** by passing outputs to downstream tools

This pattern enables:
- CI/CD integration
- Batch processing
- Custom workflows
- Automated code review pipelines

## Extending

Add new commands:

1. Create `.claude/commands/your-command.md`
2. Define input/output schema
3. Add Python wrapper in `automation/`
4. Chain commands together

Example workflow:

```bash
# 1. Generate issue with context
uv run automation/issue.py "bug description"

# 2. Plan implementation
uv run automation/plan.py --from-issue .claude/state/last_issue.json

# 3. Generate code
uv run automation/implement.py --from-plan .claude/state/last_plan.json

# 4. Create PR
uv run automation/pr.py --from-implementation .claude/state/last_impl.json
```
