#!/bin/bash
set -e

echo "🚀 Setting up Claude Meta-Prompting Demo..."

# Check for required tools
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required but not installed."; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm required. Run: npm install -g pnpm"; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup database
echo "🗄️  Setting up database..."
pnpm --filter backend run db:setup

# Seed with test data
echo "🌱 Seeding database..."
pnpm --filter backend run db:seed

# Setup Python automation (optional)
if command -v uv >/dev/null 2>&1; then
    echo "🐍 Setting up Python automation tools..."
    cd automation && uv sync && cd ..
else
    echo "⚠️  uv not found - skipping Python automation setup"
    echo "   Install from: https://docs.astral.sh/uv/"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Quick start:"
echo "  pnpm dev          # Start frontend + backend"
echo "  pnpm build        # Build for production"
echo "  pnpm reset        # Reset database"
echo ""
echo "Try the meta-prompts:"
echo "  In Claude Code: /issue fix payment webhook not updating order status"
echo "  Or via CLI:     uv run automation/issue.py \"fix payment webhook\""
echo ""
