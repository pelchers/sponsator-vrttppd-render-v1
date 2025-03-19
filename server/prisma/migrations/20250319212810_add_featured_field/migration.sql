/*
  Warnings:

  - Made the column `featured` on table `articles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `featured` on table `comments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `featured` on table `posts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `featured` on table `projects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `featured` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "articles" ALTER COLUMN "featured" SET NOT NULL;

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "featured" SET NOT NULL;

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "featured" SET NOT NULL;

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "featured" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "featured" SET NOT NULL;
