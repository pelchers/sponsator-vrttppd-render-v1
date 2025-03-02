/*
  Warnings:

  - You are about to drop the `Article` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_authorId_fkey";

-- DropTable
DROP TABLE "Article";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "profile_image" TEXT,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "bio" TEXT,
    "user_type" TEXT,
    "career_title" TEXT,
    "career_experience" INTEGER NOT NULL DEFAULT 0,
    "social_media_handle" TEXT,
    "social_media_followers" INTEGER NOT NULL DEFAULT 0,
    "company" TEXT,
    "company_location" TEXT,
    "company_website" TEXT,
    "contract_type" TEXT,
    "contract_duration" TEXT,
    "contract_rate" TEXT,
    "availability_status" TEXT,
    "preferred_work_type" TEXT,
    "rate_range" TEXT,
    "currency" TEXT DEFAULT 'USD',
    "standard_service_rate" TEXT,
    "standard_rate_type" TEXT,
    "compensation_type" TEXT,
    "skills" TEXT[],
    "expertise" TEXT[],
    "target_audience" TEXT[],
    "solutions_offered" TEXT[],
    "interest_tags" TEXT[],
    "experience_tags" TEXT[],
    "education_tags" TEXT[],
    "work_status" TEXT,
    "seeking" TEXT,
    "social_links_youtube" TEXT,
    "social_links_instagram" TEXT,
    "social_links_github" TEXT,
    "social_links_twitter" TEXT,
    "social_links_linkedin" TEXT,
    "website_links" TEXT[],
    "short_term_goals" TEXT,
    "long_term_goals" TEXT,
    "profile_visibility" TEXT DEFAULT 'public',
    "search_visibility" BOOLEAN DEFAULT true,
    "notification_preferences_email" BOOLEAN DEFAULT true,
    "notification_preferences_push" BOOLEAN DEFAULT true,
    "notification_preferences_digest" BOOLEAN DEFAULT true,
    "password_hash" TEXT,
    "account_status" TEXT DEFAULT 'active',
    "last_active" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_work_experience" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "years" TEXT,
    "media" TEXT,

    CONSTRAINT "user_work_experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_education" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "degree" TEXT,
    "school" TEXT,
    "year" TEXT,
    "media" TEXT,

    CONSTRAINT "user_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_certifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "issuer" TEXT,
    "year" TEXT,
    "media" TEXT,

    CONSTRAINT "user_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_accolades" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "issuer" TEXT,
    "year" TEXT,
    "media" TEXT,

    CONSTRAINT "user_accolades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_endorsements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "position" TEXT,
    "company" TEXT,
    "text" TEXT,
    "media" TEXT,

    CONSTRAINT "user_endorsements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_featured_projects" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "url" TEXT,
    "media" TEXT,

    CONSTRAINT "user_featured_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_case_studies" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "url" TEXT,
    "media" TEXT,

    CONSTRAINT "user_case_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "mediaUrl" TEXT,
    "tags" TEXT[],
    "description" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_name" TEXT,
    "project_description" TEXT,
    "project_type" TEXT,
    "project_category" TEXT,
    "project_image" TEXT,
    "project_title" TEXT,
    "project_duration" TEXT,
    "project_handle" TEXT,
    "project_followers" INTEGER NOT NULL DEFAULT 0,
    "client" TEXT,
    "client_location" TEXT,
    "client_website" TEXT,
    "contract_type" TEXT,
    "contract_duration" TEXT,
    "contract_value" TEXT,
    "project_timeline" TEXT,
    "budget" TEXT,
    "project_status" TEXT,
    "preferred_collaboration_type" TEXT,
    "budget_range" TEXT,
    "currency" TEXT DEFAULT 'USD',
    "standard_rate" TEXT,
    "rate_type" TEXT,
    "compensation_type" TEXT,
    "skills_required" TEXT[],
    "expertise_needed" TEXT[],
    "target_audience" TEXT[],
    "solutions_offered" TEXT[],
    "project_tags" TEXT[],
    "industry_tags" TEXT[],
    "technology_tags" TEXT[],
    "project_status_tag" TEXT,
    "seeking_creator" BOOLEAN DEFAULT false,
    "seeking_brand" BOOLEAN DEFAULT false,
    "seeking_freelancer" BOOLEAN DEFAULT false,
    "seeking_contractor" BOOLEAN DEFAULT false,
    "social_links_youtube" TEXT,
    "social_links_instagram" TEXT,
    "social_links_github" TEXT,
    "social_links_twitter" TEXT,
    "social_links_linkedin" TEXT,
    "website_links" TEXT[],
    "short_term_goals" TEXT,
    "long_term_goals" TEXT,
    "project_visibility" TEXT DEFAULT 'public',
    "search_visibility" BOOLEAN DEFAULT true,
    "notification_preferences_email" BOOLEAN DEFAULT true,
    "notification_preferences_push" BOOLEAN DEFAULT true,
    "notification_preferences_digest" BOOLEAN DEFAULT true,
    "deliverables" JSONB,
    "milestones" JSONB,
    "team_members" JSONB,
    "collaborators" JSONB,
    "advisors" JSONB,
    "partners" JSONB,
    "testimonials" JSONB,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "tags" TEXT[],
    "citations" TEXT[],
    "contributors" TEXT[],
    "related_media" TEXT[],
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_sections" (
    "id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "type" TEXT,
    "title" TEXT,
    "subtitle" TEXT,
    "text" TEXT,
    "media_url" TEXT,
    "media_subtext" TEXT,

    CONSTRAINT "article_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "text" TEXT,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "follower_id" TEXT NOT NULL,
    "followed_type" TEXT NOT NULL,
    "followed_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "watch_type" TEXT NOT NULL,
    "watch_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watches_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_work_experience" ADD CONSTRAINT "user_work_experience_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_education" ADD CONSTRAINT "user_education_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_certifications" ADD CONSTRAINT "user_certifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_accolades" ADD CONSTRAINT "user_accolades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_endorsements" ADD CONSTRAINT "user_endorsements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_featured_projects" ADD CONSTRAINT "user_featured_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_case_studies" ADD CONSTRAINT "user_case_studies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_sections" ADD CONSTRAINT "article_sections_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watches" ADD CONSTRAINT "watches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
