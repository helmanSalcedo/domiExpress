-- Initial database setup script
-- Run this on database initialization

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Enable PostGIS if needed for location-based queries
-- CREATE EXTENSION IF NOT EXISTS "postgis";
-- CREATE EXTENSION IF NOT EXISTS "postgis_topology";

-- Create initial schema
-- This is handled by Prisma migrations, but we can add custom logic here if needed

-- Create search index for full-text search
-- This will be created by Prisma after tables exist

GRANT ALL PRIVILEGES ON DATABASE domiexpress_dev TO domiexpress;
GRANT ALL PRIVILEGES ON SCHEMA public TO domiexpress;
