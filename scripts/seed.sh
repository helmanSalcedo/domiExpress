#!/bin/bash

# Temporarily switch to localhost for seeding
sed -i.bak 's/DATABASE_URL="postgresql:\/\/postgres:postgres@host\.docker\.internal:5432\/domiexpress"/DATABASE_URL="postgresql:\/\/postgres:postgres@localhost:5432\/domiexpress"/g' .env
sed -i.bak 's/DB_HOST=host\.docker\.internal/DB_HOST=localhost/g' .env

# Run seed
npx ts-node scripts/seed-professional.ts

# Restore original config
sed -i.bak 's/DATABASE_URL="postgresql:\/\/postgres:postgres@localhost:5432\/domiexpress"/DATABASE_URL="postgresql:\/\/postgres:postgres@host\.docker\.internal:5432\/domiexpress"/g' .env
sed -i.bak 's/DB_HOST=localhost/DB_HOST=host.docker.internal/g' .env

# Clean up backup
rm -f .env.bak
