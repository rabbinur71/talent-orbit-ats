#!/bin/sh
set -e

# Wait briefly for DB DNS + port (simple check)
echo "Waiting for database..."
for i in $(seq 1 30); do
  if node -e "require('net').connect({host: 'db', port: 5432}).on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))"; then
    break
  fi
  sleep 1
done

echo "Running Prisma generate..."
pnpm exec prisma generate

echo "Running Prisma migrations..."
pnpm exec prisma migrate deploy

echo "Starting auth service..."
node dist/src/main.js
