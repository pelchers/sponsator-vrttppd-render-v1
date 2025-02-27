```ts
/**
 * ============================================================
 *        HOW TO IMPLEMENT THE "USER PROFILE" EDIT FLOW
 * ============================================================
 *
 * This guide explains how to:
 *  1) Align your front-end "ProfileEditForm" data with the
 *     Prisma `users` model (and its child tables like 
 *     `user_work_experience`, `user_education`, etc.).
 *  2) Create or update a user's profile, including simple fields,
 *     string arrays, booleans, and child records for work 
 *     experience, education, etc.
 *  3) Map nested front-end arrays of objects (e.g., 
 *     formData.work_experience) to the child tables 
 *     (e.g., user_work_experience).
 *
 * ============================================================
 * 1. YOUR PRISMA SCHEMA
 *
 *   // This is a simplified reference of the relevant parts:
 *
 *   model users {
 *     id                String    @id @default(uuid())
 *     profile_image     String?
 *     username          String?
 *     email             String   // not optional in your schema
 *     bio               String?
 *     user_type         String?
 *     career_title      String?
 *     career_experience Int      @default(0)
 *     social_media_handle    String?
 *     social_media_followers Int @default(0)
 *     company           String?
 *     company_location  String?
 *     company_website   String?
 *     contract_type     String?
 *     contract_duration String?
 *     contract_rate     String?
 *
 *     availability_status  String?
 *     preferred_work_type  String?
 *     rate_range           String?
 *     currency             String? @default("USD")
 *     standard_service_rate String?
 *     standard_rate_type   String?
 *     compensation_type    String?
 *
 *     // Array fields
 *     skills           String[]
 *     expertise        String[]
 *     target_audience  String[]
 *     solutions_offered String[]
 *     interest_tags    String[]
 *     experience_tags  String[]
 *     education_tags   String[]
 *     website_links    String[]
 *
 *     // Status fields
 *     work_status      String?
 *     seeking          String?
 *
 *     // Social links as separate columns in DB
 *     social_links_youtube   String?
 *     social_links_instagram String?
 *     social_links_github    String?
 *     social_links_twitter   String?
 *     social_links_linkedin  String?
 *
 *     short_term_goals String?
 *     long_term_goals  String?
 *
 *     profile_visibility             String?  @default("public")
 *     search_visibility              Boolean? @default(true)
 *     notification_preferences_email  Boolean? @default(true)
 *     notification_preferences_push   Boolean? @default(true)
 *     notification_preferences_digest Boolean? @default(true)
 *
 *     // Child relations for each sub-table:
 *     user_work_experience   user_work_experience[]
 *     user_education         user_education[]
 *     user_certifications    user_certifications[]
 *     user_accolades         user_accolades[]
 *     user_endorsements      user_endorsements[]
 *     user_featured_projects user_featured_projects[]
 *     user_case_studies      user_case_studies[]
 *
 *     // [omitted for brevity: other fields like password_hash, timestamps]
 *   }
 *
 *   // Example child table: user_work_experience
 *   model user_work_experience {
 *     id      String  @id @default(uuid())
 *     user_id String
 *     title   String?
 *     company String?
 *     years   String?
 *     media   String?  // store file path or URL if needed
 *
 *     users users? @relation(fields: [user_id], references: [id], onDelete: Cascade)
 *     @@map("user_work_experience")
 *   }
 *
 *   // Similarly for user_education, user_certifications, etc.
 *
 * ============================================================
 * 2. FRONT-END FORM STRUCTURE
 *
 *   Your `ProfileEditForm` uses a big `formData` object with 
 *   nested arrays for child items:
 *
 *   const [formData, setFormData] = useState({
 *     profile_image: null,
 *     username: "",
 *     email: "",
 *     // ...
 *     skills: [] as string[],
 *     expertise: [] as string[],
 *     target_audience: [] as string[],
 *     solutions_offered: [] as string[],
 *     interest_tags: [] as string[],
 *     experience_tags: [] as string[],
 *     education_tags: [] as string[],
 *
 *     // social links are an object:
 *     social_links: {
 *       youtube: "",
 *       instagram: "",
 *       github: "",
 *       twitter: "",
 *       linkedin: "",
 *     },
 *
 *     website_links: [] as string[],
 *
 *     // child tables stored in arrays of objects:
 *     work_experience: [] as { title: string; company: string; years: string; media?: File }[],
 *     education:       [] as { degree: string; school: string; year: string; media?: File }[],
 *     certifications:  [] as { name: string; issuer: string; year: string; media?: File }[],
 *     accolades:       [] as { title: string; issuer: string; year: string; media?: File }[],
 *     endorsements:    [] as { name: string; position: string; company: string; text: string; media?: File }[],
 *     featured_projects: [] as { title: string; description: string; url: string; media?: File }[],
 *     case_studies:      [] as { title: string; description: string; url: string; media?: File }[],
 *     // ...
 *   })
 *
 *   Notice that in Prisma, the user table stores references to 
 *   child relations for experience, education, etc. Each child 
 *   table has a foreign key `user_id`.
 *
 *   So to store `work_experience` from your form, you actually 
 *   create or update multiple rows in the `user_work_experience` table. 
 *
 * ============================================================
 * 3. MAPPING FORM FIELDS TO THE USERS TABLE
 *
 *   // On the server side (Node/Express or Next API route), 
 *   // you'll do something like:
 *
 *   import { prisma } from "../prismaClient"
 *
 *   async function updateUserProfile(req, res) {
 *     try {
 *       const { userId } = req.params  // e.g., from URL
 *       const formData = req.body      // the big object
 *
 *       // 1) Map the "top-level" fields:
 *       await prisma.users.update({
 *         where: { id: userId },
 *         data: {
 *           // e.g. strings:
 *           username: formData.username,
 *           email: formData.email,
 *           bio: formData.bio,
 *           user_type: formData.user_type,
 *
 *           career_title: formData.career_title,
 *           career_experience: formData.career_experience,
 *           social_media_handle: formData.social_media_handle,
 *           social_media_followers: formData.social_media_followers,
 *           company: formData.company,
 *           company_location: formData.company_location,
 *           company_website: formData.company_website,
 *           contract_type: formData.contract_type,
 *           contract_duration: formData.contract_duration,
 *           contract_rate: formData.contract_rate,
 *
 *           availability_status: formData.availability_status,
 *           preferred_work_type: formData.preferred_work_type,
 *           rate_range: formData.rate_range,
 *           currency: formData.currency,
 *           standard_service_rate: formData.standard_service_rate,
 *           standard_rate_type: formData.standard_rate_type,
 *           compensation_type: formData.compensation_type,
 *
 *           // Arrays of strings:
 *           skills: formData.skills,
 *           expertise: formData.expertise,
 *           target_audience: formData.target_audience,
 *           solutions_offered: formData.solutions_offered,
 *           interest_tags: formData.interest_tags,
 *           experience_tags: formData.experience_tags,
 *           education_tags: formData.education_tags,
 *           website_links: formData.website_links,
 *
 *           // Single-value fields:
 *           work_status: formData.work_status,
 *           seeking: formData.seeking,
 *
 *           short_term_goals: formData.short_term_goals,
 *           long_term_goals: formData.long_term_goals,
 *
 *           profile_visibility: formData.profile_visibility,
 *           search_visibility: formData.search_visibility,
 *
 *           // Notification preferences booleans
 *           notification_preferences_email: formData.notification_preferences.email,
 *           notification_preferences_push: formData.notification_preferences.push,
 *           notification_preferences_digest: formData.notification_preferences.digest,
 *
 *           // Social links are separate columns in the DB:
 *           social_links_youtube: formData.social_links.youtube,
 *           social_links_instagram: formData.social_links.instagram,
 *           social_links_github: formData.social_links.github,
 *           social_links_twitter: formData.social_links.twitter,
 *           social_links_linkedin: formData.social_links.linkedin,
 *         },
 *       })
 *
 *       // 2) For each child table, you might handle them separately:
 *       // e.g. user_work_experience
 *
 *       //   A. Delete existing experiences for user
 *       await prisma.user_work_experience.deleteMany({
 *         where: { user_id: userId },
 *       })
 *
 *       //   B. Create new ones from formData.work_experience
 *       const experienceData = formData.work_experience.map((exp) => ({
 *         user_id: userId,
 *         title: exp.title,
 *         company: exp.company,
 *         years: exp.years,
 *         // Possibly store the uploaded file somewhere, then put path in `media`
 *         media: exp.media ? "/uploads/" + exp.media.name : null,
 *       }))
 *
 *       await prisma.user_work_experience.createMany({ data: experienceData })
 *
 *       // Similar approach for user_education, user_certifications,
 *       // user_accolades, user_endorsements, user_featured_projects,
 *       // user_case_studies. E.g.:
 *
 *       await prisma.user_education.deleteMany({ where: { user_id: userId } })
 *       // Then createMany() from formData.education
 *
 *       // etc...
 *
 *       return res.json({ message: "Profile updated successfully" })
 *     } catch (error) {
 *       console.error(error)
 *       return res.status(500).json({ error: "Failed to update user profile" })
 *     }
 *   }
 *
 *  Explanation:
 *   - The parent `users` table is updated with all the standard fields. 
 *   - For each child section (work_experience, education, etc.), 
 *     you remove old records, then insert new ones. 
 *     (Or you could do a more fine-grained approach if you need partial edits 
 *     that preserve existing IDs.)
 *
 * ============================================================
 * 4. STORING THE `profile_image`
 *
 *   Your form uses `profile_image: File | null`. 
 *   In your Prisma model, `profile_image` is a `String?`. 
 *   So typically, you'd:
 *    - Upload the file to an S3 bucket or local folder.
 *    - Get the resulting URL or path.
 *    - Update `users.profile_image` = that URL/string path.
 *
 *   If you want to store the binary data directly in the DB, 
 *   you'd need a different approach (e.g., a base64 column). 
 *   Typically storing the file on disk or a CDN is more common.
 *
 * ============================================================
 * 5. CREATING A NEW PROFILE
 *
 *   If you have a brand-new user (sign-up flow), 
 *   you might do `prisma.users.create(...)` instead of `.update`.
 *   The logic is the same: 
 *   - Insert top-level fields into `users`. 
 *   - Insert child items into each `user_education`, etc., 
 *     referencing the new user’s ID.
 *
 * ============================================================
 * 6. OPTIONAL ENHANCEMENTS
 *
 *   - **Granular Updates**: 
 *     Instead of deleting all user_work_experience rows, 
 *     you can do an upsert approach if you keep track of IDs 
 *     on each experience record. 
 *     e.g., if (experience.id) => update, else => create. 
 *   - **File Uploads**: 
 *     If multiple fields allow file uploads, you might adopt 
 *     a library like `multer` or handle them in Next's server 
 *     routes, then store the final file path/URL in `media`.
 *   - **Validation**: 
 *     Ensure `email` is valid, or that numeric fields (like 
 *     `career_experience`) aren’t negative, etc.
 *
 * ============================================================
 * 7. SUMMARY
 *
 *   - The **users** table holds top-level fields (strings, booleans, arrays).
 *   - **Child tables** (user_work_experience, etc.) store multi-object arrays, 
 *     so you handle them by creating or updating multiple rows 
 *     with `user_id` as the foreign key.
 *   - On your front end, you collect all these nested fields. 
 *   - On submit, you call your API route. The server updates `users` 
 *     for top-level fields, then loops over each child array 
 *     (like `work_experience`) to create child records.
 *   - This approach fully matches the **ProfileEditForm** data structure 
 *     to your Prisma schema.
 */
```