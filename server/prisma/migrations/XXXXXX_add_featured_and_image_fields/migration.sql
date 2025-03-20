-- First, handle the featured fields
DO $$ BEGIN
    -- Add featured column to each table if it doesn't exist
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

-- Then handle image fields
-- First backup existing image data
CREATE TEMP TABLE IF NOT EXISTS user_images AS 
SELECT id, profile_image FROM users WHERE profile_image IS NOT NULL;

CREATE TEMP TABLE IF NOT EXISTS project_images AS 
SELECT id, project_image FROM projects WHERE project_image IS NOT NULL;

CREATE TEMP TABLE IF NOT EXISTS post_images AS 
SELECT id, "mediaUrl" FROM posts WHERE "mediaUrl" IS NOT NULL;

-- Remove old image fields
ALTER TABLE "users" DROP COLUMN IF EXISTS "profile_image";
ALTER TABLE "projects" DROP COLUMN IF EXISTS "project_image";
ALTER TABLE "posts" DROP COLUMN IF EXISTS "mediaUrl";

-- Add new image fields
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "profile_image_url" TEXT,
ADD COLUMN IF NOT EXISTS "profile_image_upload" TEXT;

ALTER TABLE "projects" 
ADD COLUMN IF NOT EXISTS "project_image_url" TEXT,
ADD COLUMN IF NOT EXISTS "project_image_upload" TEXT;

ALTER TABLE "articles" 
ADD COLUMN IF NOT EXISTS "article_image_url" TEXT,
ADD COLUMN IF NOT EXISTS "article_image_upload" TEXT;

ALTER TABLE "posts" 
ADD COLUMN IF NOT EXISTS "post_image_url" TEXT,
ADD COLUMN IF NOT EXISTS "post_image_upload" TEXT;

-- Migrate existing image data to URL fields
UPDATE users u 
SET profile_image_url = i.profile_image 
FROM user_images i 
WHERE u.id = i.id;

UPDATE projects p 
SET project_image_url = i.project_image 
FROM project_images i 
WHERE p.id = i.id;

UPDATE posts p 
SET post_image_url = i."mediaUrl" 
FROM post_images i 
WHERE p.id = i.id;

-- Clean up temp tables
DROP TABLE IF EXISTS user_images;
DROP TABLE IF EXISTS project_images;
DROP TABLE IF EXISTS post_images; 