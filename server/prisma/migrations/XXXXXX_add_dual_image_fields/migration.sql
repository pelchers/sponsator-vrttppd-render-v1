-- First remove old image fields
ALTER TABLE "users" DROP COLUMN IF EXISTS "profile_image";
ALTER TABLE "projects" DROP COLUMN IF EXISTS "project_image";
ALTER TABLE "posts" DROP COLUMN IF EXISTS "mediaUrl";

-- Add new image fields for users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_image_url" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_image_upload" TEXT;

-- Add new image fields for projects
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "project_image_url" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "project_image_upload" TEXT;

-- Add new image fields for articles
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "article_image_url" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "article_image_upload" TEXT;

-- Add new image fields for posts
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "post_image_url" TEXT;
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "post_image_upload" TEXT; 