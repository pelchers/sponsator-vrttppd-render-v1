-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "article_image_display" TEXT DEFAULT 'url';

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "post_image_display" TEXT DEFAULT 'url';

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "project_image_display" TEXT DEFAULT 'url';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profile_image_display" TEXT DEFAULT 'url';
