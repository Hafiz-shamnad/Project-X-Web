#!/bin/sh
set -e

DB_HOST="db"

echo "⏳ Waiting for database at $DB_HOST:5432..."

# Same logic you already had
until nc -z $DB_HOST 5432; do
  echo "   ↳ DB not ready, retrying..."
  sleep 1
done

echo "✅ Database is up!"

echo "🚀 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Running admin seed..."
node prisma/seed.js

echo "🚀 Starting backend server..."
exec node server.js
