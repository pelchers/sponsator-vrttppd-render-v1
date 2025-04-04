/*
  PRISMA TYPE CONVENTIONS:

  This schema uses simple Prisma types instead of explicit PostgreSQL types because:
  
  1. Automatic Type Mapping:
     - Prisma automatically maps basic types to appropriate PostgreSQL types
     - String -> TEXT
     - String[] -> TEXT[]
     - DateTime -> TIMESTAMPTZ
     - Boolean -> BOOLEAN
     - Int -> INTEGER
  
  2. UUID Handling:
     - @default(uuid()) works the same as @default(dbgenerated("gen_random_uuid()"))
     - No need for explicit @db.Uuid unless specific PostgreSQL UUID functions are needed
  
  3. Benefits:
     - Cleaner schema
     - Easier maintenance
     - Same functionality
     - Prisma handles PostgreSQL type mapping automatically
  
  Note: We keep @db.Text and @db.Uuid in this schema only because we're using specific 
  PostgreSQL functions like gen_random_uuid(). For most cases, simple String type would work.

  Key Changes Made compared to schema.md:
  1. Removed all @db.Text modifiers (Prisma handles TEXT type)
  2. Simplified UUID generation to @default(uuid())
  3. Removed @db.Uuid from foreign key fields
  4. Removed @db.Timestamptz(6) from DateTime fields
  5. Kept all relations and mappings intact (@relation, @@map)
  6. Maintained all default values and optionality (?)
*/

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// --------------------
//   USERS MODEL
// --------------------
model users {
  id                             String    @id @default(uuid())
  profile_image                  String?
  username                       String?
  email                         String
  bio                           String?
  user_type                     String?
  career_title                  String?
  career_experience             Int       @default(0)
  social_media_handle           String?
  social_media_followers        Int       @default(0)
  company                       String?
  company_location              String?
  company_website               String?
  contract_type                 String?
  contract_duration             String?
  contract_rate                 String?
  availability_status           String?
  preferred_work_type           String?
  rate_range                    String?
  currency                      String?   @default("USD")
  standard_service_rate         String?
  standard_rate_type            String?
  compensation_type             String?
  skills                        String[]
  expertise                     String[]
  target_audience               String[]
  solutions_offered             String[]
  interest_tags                 String[]
  experience_tags               String[]
  education_tags                String[]
  work_status                   String?
  seeking                       String?
  social_links_youtube          String?
  social_links_instagram        String?
  social_links_github           String?
  social_links_twitter          String?
  social_links_linkedin         String?
  website_links                 String[]
  short_term_goals              String?
  long_term_goals               String?
  profile_visibility            String?   @default("public")
  search_visibility             Boolean?  @default(true)
  notification_preferences_email Boolean?  @default(true)
  notification_preferences_push  Boolean?  @default(true)
  notification_preferences_digest Boolean? @default(true)
  password_hash                 String?
  account_status                String?   @default("active")
  last_active                   DateTime?
  created_at                    DateTime? @default(now())
  updated_at                    DateTime? @default(now())

  // Child relations:
  user_work_experience   user_work_experience[]
  user_education         user_education[]
  user_certifications    user_certifications[]
  user_accolades         user_accolades[]
  user_endorsements      user_endorsements[]
  user_featured_projects user_featured_projects[]
  user_case_studies      user_case_studies[]

  // Relationships to other tables:
  posts     posts[]
  projects  projects[]
  articles  articles[]

  @@map("users")
}

// -------------
//   CHILD TABLES
// -------------
model user_work_experience {
  id          String  @id @default(uuid())
  user_id     String
  title       String?
  company     String?
  years       String?
  media       String?

  users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("user_work_experience")
}

model user_education {
  id          String  @id @default(uuid())
  user_id     String
  degree      String?
  school      String?
  year        String?
  media       String?

  users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("user_education")
}

model user_certifications {
  id          String  @id @default(uuid())
  user_id     String
  name        String?
  issuer      String?
  year        String?
  media       String?

  users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("user_certifications")
}

model user_accolades {
  id          String  @id @default(uuid())
  user_id     String
  title       String?
  issuer      String?
  year        String?
  media       String?

  users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("user_accolades")
}

model user_endorsements {
  id          String  @id @default(uuid())
  user_id     String
  name        String?
  position    String?
  company     String?
  text        String?
  media       String?

  users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("user_endorsements")
}

model user_featured_projects {
  id          String  @id @default(uuid())
  user_id     String
  title       String?
  description String?
  url         String?
  media       String?

  users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("user_featured_projects")
}

model user_case_studies {
  id          String  @id @default(uuid())
  user_id     String
  title       String?
  description String?
  url         String?
  media       String?

  users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("user_case_studies")
}

// -------------
//   POSTS MODEL
// -------------
model posts {
  id          String   @id @default(uuid())
  user_id     String
  title       String?
  mediaUrl    String?
  tags        String[]
  description String?
  likes       Int      @default(0)
  comments    Int      @default(0)

  users users @relation(fields: [user_id], references: [id], onDelete: Cascade)

  created_at DateTime? @default(now())
  updated_at DateTime? @default(now())

  @@map("posts")
}

// ---------------
//   PROJECTS MODEL
// ---------------
model projects {
  id                                 String   @id @default(uuid())
  user_id                            String

  project_name                       String?
  project_description                String?
  project_type                       String?
  project_category                   String?
  project_image                      String?
  project_title                      String?
  project_duration                   String?
  project_handle                     String?
  project_followers                  Int      @default(0)
  client                             String?
  client_location                    String?
  client_website                     String?
  contract_type                      String?
  contract_duration                  String?
  contract_value                     String?
  project_timeline                   String?
  budget                             String?
  project_status                     String?
  preferred_collaboration_type       String?
  budget_range                       String?
  currency                           String?  @default("USD")
  standard_rate                      String?
  rate_type                          String?
  compensation_type                  String?
  skills_required                    String[]
  expertise_needed                   String[]
  target_audience                    String[]
  solutions_offered                  String[]
  project_tags                       String[]
  industry_tags                      String[]
  technology_tags                    String[]
  project_status_tag                 String?

  seeking_creator                    Boolean? @default(false)
  seeking_brand                      Boolean? @default(false)
  seeking_freelancer                Boolean? @default(false)
  seeking_contractor                 Boolean? @default(false)

  social_links_youtube               String?
  social_links_instagram             String?
  social_links_github                String?
  social_links_twitter               String?
  social_links_linkedin              String?
  website_links                      String[]

  short_term_goals                   String?
  long_term_goals                    String?

  project_visibility                 String?  @default("public")
  search_visibility                  Boolean? @default(true)
  notification_preferences_email      Boolean? @default(true)
  notification_preferences_push       Boolean? @default(true)
  notification_preferences_digest     Boolean? @default(true)

  // Added JSON columns for complex multi-field arrays:
  deliverables                       Json?
  milestones                         Json?
  team_members                       Json?
  collaborators                      Json?
  advisors                           Json?
  partners                           Json?
  testimonials                       Json?

  created_at                         DateTime? @default(now())
  updated_at                         DateTime? @default(now())

  users users @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("projects")
}

// -------------
//   ARTICLES MODEL
// -------------
model articles {
  id            String   @id @default(uuid())
  user_id       String
  title         String?
  tags          String[]
  citations     String[]
  contributors  String[]
  related_media String[]
  created_at    DateTime? @default(now())
  updated_at    DateTime? @default(now())

  users users @relation(fields: [user_id], references: [id], onDelete: Cascade)
  article_sections article_sections[]

  @@map("articles")
}

model article_sections {
  id             String  @id @default(uuid())
  article_id     String
  type           String?
  title          String?
  subtitle       String?
  text           String?
  media_url      String?
  media_subtext  String?

  articles articles @relation(fields: [article_id], references: [id], onDelete: Cascade)

  @@map("article_sections")
}

model comments {
  id          String   @id @default(uuid())
  user_id     String
  entity_type String   // e.g., "post", "project", "article", "comment", "user"
  entity_id   String   // The ID of the item being commented on
  text        String?

  // If you want a quick count of how many likes a comment has
  likes_count Int      @default(0)

  created_at  DateTime @default(now())
  updated_at  DateTime @default(now())

  // Relationship to the user (author of the comment)
  users       users?   @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("comments")
}

model likes {
  id          String   @id @default(uuid())
  user_id     String
  entity_type String   // e.g., "post", "project", "article", "comment", "user"
  entity_id   String   // The ID of the item being liked

  created_at  DateTime @default(now())

  // The user performing the "like"
  users       users?   @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("likes")
}

model follows {
  id             String   @id @default(uuid())
  follower_id    String
  followed_type  String   // e.g., "user", "project", "post", "article"
  followed_id    String

  created_at     DateTime @default(now())

  // The user who is following
  users          users?   @relation(fields: [follower_id], references: [id], onDelete: Cascade)

  @@map("follows")
}

model watches {
  id          String   @id @default(uuid())
  user_id     String
  watch_type  String   // e.g., "user", "project", "post", "article"
  watch_id    String

  created_at  DateTime @default(now())

  // The user who is watching
  users       users?   @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("watches")
}
