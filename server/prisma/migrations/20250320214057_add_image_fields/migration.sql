-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "article_image_upload" TEXT,
ADD COLUMN     "article_image_url" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "post_image_upload" TEXT,
ADD COLUMN     "post_image_url" TEXT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "project_image_upload" TEXT,
ADD COLUMN     "project_image_url" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profile_image_upload" TEXT,
ADD COLUMN     "profile_image_url" TEXT;
