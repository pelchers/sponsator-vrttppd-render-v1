/*
  Warnings:

  - You are about to drop the column `followed_id` on the `follows` table. All the data in the column will be lost.
  - You are about to drop the column `followed_type` on the `follows` table. All the data in the column will be lost.
  - You are about to drop the column `follower_id` on the `follows` table. All the data in the column will be lost.
  - You are about to drop the column `watch_id` on the `watches` table. All the data in the column will be lost.
  - You are about to drop the column `watch_type` on the `watches` table. All the data in the column will be lost.
  - Added the required column `entity_id` to the `follows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_type` to the `follows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `follows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_id` to the `watches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_type` to the `watches` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_follower_id_fkey";

-- AlterTable
ALTER TABLE "follows" DROP COLUMN "followed_id",
DROP COLUMN "followed_type",
DROP COLUMN "follower_id",
ADD COLUMN     "entity_id" TEXT NOT NULL,
ADD COLUMN     "entity_type" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "followers_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "watches" DROP COLUMN "watch_id",
DROP COLUMN "watch_type",
ADD COLUMN     "entity_id" TEXT NOT NULL,
ADD COLUMN     "entity_type" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
