-- Drop the old migration if it exists
DROP TABLE IF EXISTS _prisma_migrations;

-- Create migrations table
CREATE TABLE IF NOT EXISTS _prisma_migrations (
    id                      VARCHAR(36) PRIMARY KEY NOT NULL,
    checksum                VARCHAR(64) NOT NULL,
    finished_at             TIMESTAMP WITH TIME ZONE,
    migration_name          VARCHAR(255) NOT NULL,
    logs                    TEXT,
    rolled_back_at          TIMESTAMP WITH TIME ZONE,
    started_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    applied_steps_count     INTEGER NOT NULL DEFAULT 0
);

-- Add featured fields
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'featured') THEN
        ALTER TABLE "users" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'featured') THEN
        ALTER TABLE "projects" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'featured') THEN
        ALTER TABLE "articles" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'featured') THEN
        ALTER TABLE "posts" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'featured') THEN
        ALTER TABLE "comments" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$; 