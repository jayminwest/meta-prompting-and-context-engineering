#!/bin/bash
set -e

echo "🔄 Resetting database..."

# Remove existing database
rm -f apps/backend/data.db
rm -f apps/backend/data.db-journal

# Recreate schema
pnpm --filter backend run db:setup

# Reseed data
pnpm --filter backend run db:seed

echo "✅ Database reset complete!"
