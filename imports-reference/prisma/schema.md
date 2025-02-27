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
  id                             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  profile_image                  String?  @db.Text
  username                       String?  @db.Text
  email                          String   @db.Text
  bio                            String?  @db.Text
  user_type                      String?  @db.Text
  career_title                   String?  @db.Text
  career_experience              Int      @default(0)
  social_media_handle            String?  @db.Text
  social_media_followers         Int      @default(0)
  company                        String?  @db.Text
  company_location               String?  @db.Text
  company_website                String?  @db.Text
  contract_type                  String?  @db.Text
  contract_duration              String?  @db.Text
  contract_rate                  String?  @db.Text
  availability_status            String?  @db.Text
  preferred_work_type            String?  @db.Text
  rate_range                     String?  @db.Text
  currency                       String?  @db.Text @default("USD")
  standard_service_rate          String?  @db.Text
  standard_rate_type             String?  @db.Text
  compensation_type              String?  @db.Text
  skills                         String[] @db.Text
  expertise                      String[] @db.Text
  target_audience                String[] @db.Text
  solutions_offered              String[] @db.Text
  interest_tags                  String[] @db.Text
  experience_tags                String[] @db.Text
  education_tags                 String[] @db.Text
  work_status                    String?  @db.Text
  seeking                        String?  @db.Text
  social_links_youtube           String?  @db.Text
  social_links_instagram         String?  @db.Text
  social_links_github            String?  @db.Text
  social_links_twitter           String?  @db.Text
  social_links_linkedin          String?  @db.Text
  website_links                  String[] @db.Text
  short_term_goals               String?  @db.Text
  long_term_goals                String?  @db.Text
  profile_visibility             String?  @db.Text @default("public")
  search_visibility              Boolean? @default(true)
  notification_preferences_email  Boolean? @default(true)
  notification_preferences_push   Boolean? @default(true)
  notification_preferences_digest Boolean? @default(true)
  password_hash                  String?  @db.Text
  account_status                 String?  @db.Text @default("active")
  last_active                    DateTime? @db.Timestamptz(6)
  created_at                     DateTime? @db.Timestamptz(6) @default(now())
  updated_at                     DateTime? @db.Timestamptz(6) @default(now())

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
  id      String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id String  @db.Uuid
  title   String? @db.Text
  company String? @db.Text
  years   String? @db.Text
  media   String? @db.Text

  users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("user_work_experience")
}

model user_education {
  id      String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id String  @db.Uuid
  degree  String? @db.Text
  school  String? @db.Text
  year    String? @db.Text
  media   String? @db.Text

  users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("user_education")
}

model user_certifications {
  id      String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id String  @db.Uuid
  name    String? @db.Text
  issuer  String? @db.Text
  year    String? @db.Text
  media   String? @db.Text

  users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("user_certifications")
}

model user_accolades {
  id      String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id String  @db.Uuid
  title   String? @db.Text
  issuer  String? @db.Text
  year    String? @db.Text
  media   String? @db.Text

  users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("user_accolades")
}

model user_endorsements {
  id       String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id  String  @db.Uuid
  name     String? @db.Text
  position String? @db.Text
  company  String? @db.Text
  text     String? @db.Text
  media    String? @db.Text

  users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("user_endorsements")
}

model user_featured_projects {
  id          String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String  @db.Uuid
  title       String? @db.Text
  description String? @db.Text
  url         String? @db.Text
  media       String? @db.Text

  users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("user_featured_projects")
}

model user_case_studies {
  id          String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String  @db.Uuid
  title       String? @db.Text
  description String? @db.Text
  url         String? @db.Text
  media       String? @db.Text

  users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("user_case_studies")
}

// -------------
//   POSTS MODEL
// -------------
model posts {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String   @db.Uuid
  title       String?  @db.Text
  mediaUrl    String?  @db.Text
  tags        String[] @db.Text
  description String?  @db.Text
  likes       Int      @default(0)
  comments    Int      @default(0)

  users users @relation(fields: [user_id], references: [id], onDelete: Cascade)

  created_at DateTime? @db.Timestamptz(6) @default(now())
  updated_at DateTime? @db.Timestamptz(6) @default(now())

  @@map("posts")
}

// ---------------
//   PROJECTS MODEL
// ---------------
model projects {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id             String   @db.Uuid
  project_name        String?  @db.Text
  project_description String?  @db.Text
  project_type        String?  @db.Text
  project_category    String?  @db.Text
  project_image       String?  @db.Text
  project_title       String?  @db.Text
  project_duration    String?  @db.Text
  project_handle      String?  @db.Text
  project_followers   Int      @default(0)
  client              String?  @db.Text
  client_location     String?  @db.Text
  client_website      String?  @db.Text
  contract_type       String?  @db.Text
  contract_duration   String?  @db.Text
  contract_value      String?  @db.Text
  project_timeline    String?  @db.Text
  budget              String?  @db.Text
  project_status      String?  @db.Text
  preferred_collaboration_type String? @db.Text
  budget_range        String?  @db.Text
  currency            String?  @db.Text @default("USD")
  standard_rate       String?  @db.Text
  rate_type           String?  @db.Text
  compensation_type   String?  @db.Text
  skills_required     String[] @db.Text
  expertise_needed    String[] @db.Text
  target_audience     String[] @db.Text
  solutions_offered   String[] @db.Text
  project_tags        String[] @db.Text
  industry_tags       String[] @db.Text
  technology_tags     String[] @db.Text
  project_status_tag  String?  @db.Text
  seeking_creator     Boolean? @default(false)
  seeking_brand       Boolean? @default(false)
  seeking_freelancer  Boolean? @default(false)
  seeking_contractor  Boolean? @default(false)
  social_links_youtube   String? @db.Text
  social_links_instagram String? @db.Text
  social_links_github    String? @db.Text
  social_links_twitter   String? @db.Text
  social_links_linkedin  String? @db.Text
  website_links          String[] @db.Text
  short_term_goals   String? @db.Text
  long_term_goals    String? @db.Text
  project_visibility             String?  @db.Text @default("public")
  search_visibility              Boolean? @default(true)
  notification_preferences_email  Boolean? @default(true)
  notification_preferences_push   Boolean? @default(true)
  notification_preferences_digest Boolean? @default(true)

  created_at DateTime? @db.Timestamptz(6) @default(now())
  updated_at DateTime? @db.Timestamptz(6) @default(now())

  users users @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("projects")
}

// -------------
//   ARTICLES MODEL
// -------------
model articles {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id       String   @db.Uuid
  title         String?  @db.Text
  tags          String[] @db.Text
  citations     String[] @db.Text
  contributors  String[] @db.Text
  related_media String[] @db.Text
  created_at    DateTime? @db.Timestamptz(6) @default(now())
  updated_at    DateTime? @db.Timestamptz(6) @default(now())

  users users @relation(fields: [user_id], references: [id], onDelete: Cascade)
  article_sections article_sections[]

  @@map("articles")
}

model article_sections {
  id             String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  article_id     String  @db.Uuid
  type           String? @db.Text
  title          String? @db.Text
  subtitle       String? @db.Text
  text           String? @db.Text
  media_url      String? @db.Text
  media_subtext  String? @db.Text

  articles articles @relation(fields: [article_id], references: [id], onDelete: Cascade)

  @@map("article_sections")
}