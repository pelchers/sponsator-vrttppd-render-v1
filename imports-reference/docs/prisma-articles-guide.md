```ts
/**
 * ============================================================
 *         HOW TO IMPLEMENT THE "ARTICLES + SECTIONS" FLOW
 * ============================================================
 *
 * This guide explains how to:
 *  1) Align your front-end "Article Edit Page" data with the
 *     Prisma `articles` and `article_sections` models
 *  2) Create or update articles (including sections) in your
 *     database
 *  3) Handle arrays like `citations`, `contributors`, etc.
 *  4) Manage multiple "sections" (e.g., full-width-text,
 *     left-media-right-text) in the DB
 *
 * ============================================================
 * 1. PRISMA SCHEMA:
 *
 *  // In schema.prisma:
 *
 *  model articles {
 *    id               String   @id @default(uuid())
 *    user_id          String
 *    title            String?
 *    tags             String[]
 *    citations        String[]
 *    contributors     String[]
 *    related_media    String[]
 *    created_at       DateTime? @default(now())
 *    updated_at       DateTime? @default(now())
 *
 *    // Relationship: The user who owns/created the article
 *    users            users            @relation(fields: [user_id], references: [id], onDelete: Cascade)
 *
 *    // Relationship: Each article can have multiple sections
 *    article_sections article_sections[]
 *
 *    @@map("articles")
 *  }
 *
 *  model article_sections {
 *    id             String  @id @default(uuid())
 *    article_id     String
 *    type           String?  // e.g. "full-width-text", "left-media-right-text"
 *    title          String?
 *    subtitle       String?
 *    text           String?
 *    media_url      String?
 *    media_subtext  String?
 *
 *    // Relationship: which article this section belongs to
 *    articles articles @relation(fields: [article_id], references: [id], onDelete: Cascade)
 *
 *    @@map("article_sections")
 *  }
 *
 *  NOTE:
 *  - Arrays like `tags`, `citations`, `contributors`, and `related_media`
 *    are simply `String[]`.
 *  - Make sure you run `npx prisma migrate dev --name add_articles_schema`
 *    (or an appropriate migration name) after adding these.
 *
 * ============================================================
 * 2. FRONT-END STRUCTURE (React Example):
 *
 *  Your ArticleEditPage state might look like:
 *
 *    interface Section {
 *      type: "full-width-text" | "full-width-media" | "left-media-right-text" | "left-text-right-media"
 *      title: string
 *      subtitle?: string
 *      text?: string
 *      mediaUrl?: string
 *      mediaSubtext?: string
 *    }
 *
 *    // E.g.:
 *    const [title, setTitle] = useState("")
 *    const [sections, setSections] = useState<Section[]>([])
 *    const [citations, setCitations] = useState<string[]>([])
 *    const [contributors, setContributors] = useState<string[]>([])
 *    const [relatedMedia, setRelatedMedia] = useState<string[]>([])
 *    const [tags, setTags] = useState<string[]>([])
 *
 *  This closely matches fields in `articles` (for top-level arrays)
 *  and `article_sections` (for each section).
 *
 * ============================================================
 * 3. CREATING AN ARTICLE (Server Example)
 *
 *  Suppose you have a POST route or function to create a new article:
 *
 *    import { prisma } from "../prismaClient" // Adjust path as needed
 *
 *    async function createArticle(req, res) {
 *      try {
 *        const {
 *          user_id,
 *          title,
 *          tags,
 *          citations,
 *          contributors,
 *          relatedMedia,
 *          sections,
 *        } = req.body
 *
 *        // 1) Create the article record
 *        const article = await prisma.articles.create({
 *          data: {
 *            user_id,
 *            title,
 *            tags,
 *            citations,
 *            contributors,
 *            related_media: relatedMedia,
 *          },
 *        })
 *
 *        // 2) For each "section" object, create an article_sections row
 *        const sectionData = sections.map((section) => ({
 *          article_id: article.id,
 *          type: section.type,
 *          title: section.title,
 *          subtitle: section.subtitle,
 *          text: section.text,
 *          media_url: section.mediaUrl,
 *          media_subtext: section.mediaSubtext,
 *        }))
 *
 *        // Bulk-insert the sections
 *        await prisma.article_sections.createMany({
 *          data: sectionData,
 *        })
 *
 *        return res.status(200).json({
 *          message: "Article created successfully",
 *          articleId: article.id,
 *        })
 *      } catch (error) {
 *        console.error(error)
 *        return res.status(500).json({ error: "Failed to create article" })
 *      }
 *    }
 *
 *  Explanation:
 *   - We store top-level fields in the `articles` table (title, tags, etc.).
 *   - We store each section in `article_sections` with a foreign key (`article_id`).
 *   - `media_url` in the DB matches `mediaUrl` in front-end code by mapping
 *     the fields.
 *
 * ============================================================
 * 4. UPDATING AN ARTICLE
 *
 *  If the user edits an existing article, you might:
 *  - Update the `articles` table with new top-level data (title, tags, etc.)
 *  - Delete old sections & re-insert the new array, or do a more granular approach
 *
 *    async function updateArticle(req, res) {
 *      try {
 *        const { articleId } = req.params
 *        const {
 *          title,
 *          tags,
 *          citations,
 *          contributors,
 *          relatedMedia,
 *          sections,
 *        } = req.body
 *
 *        // 1) Update the 'articles' record
 *        await prisma.articles.update({
 *          where: { id: articleId },
 *          data: {
 *            title,
 *            tags,
 *            citations,
 *            contributors,
 *            related_media: relatedMedia,
 *          },
 *        })
 *
 *        // 2) Remove old sections
 *        await prisma.article_sections.deleteMany({
 *          where: { article_id: articleId },
 *        })
 *
 *        // 3) Insert the new sections
 *        const sectionData = sections.map((section) => ({
 *          article_id: articleId,
 *          type: section.type,
 *          title: section.title,
 *          subtitle: section.subtitle,
 *          text: section.text,
 *          media_url: section.mediaUrl,
 *          media_subtext: section.mediaSubtext,
 *        }))
 *
 *        await prisma.article_sections.createMany({ data: sectionData })
 *
 *        return res.status(200).json({ message: "Article updated" })
 *      } catch (error) {
 *        console.error(error)
 *        return res.status(500).json({ error: "Failed to update article" })
 *      }
 *    }
 *
 *  Explanation:
 *   - This approach forcibly removes all old sections then re-creates them
 *     from the updated form data.
 *   - If you need more nuanced updates (like editing a single section while
 *     preserving the others' IDs), you can handle that with a loop of
 *     `upsert()` calls or by matching on ID for each section. But the
 *     remove-all + re-insert method is simpler if you don’t mind losing
 *     the old `article_sections` IDs.
 *
 * ============================================================
 * 5. OPTIONAL ENHANCEMENTS
 *
 *   - **Ordering**: If you want guaranteed ordering for sections, add a
 *     "position Int" column to `article_sections` and store the index.
 *     Then you can `ORDER BY position ASC`.
 *
 * ============================================================
 * 6. FRONT-END TO SERVER FLOW
 *
 *   - The user loads an "Edit Article" page. If it's an existing article,
 *     you fetch from the DB and hydrate your React state with:
 *       title, tags, citations, contributors, relatedMedia,
 *       plus an array of { type, title, subtitle, text, mediaUrl, mediaSubtext }.
 *
 *   - After editing, the user hits "Save" or "Update".
 *     - You POST or PUT that data (article fields + sections array)
 *       to your server route (createArticle or updateArticle).
 *     - The server writes `articles` + `article_sections`.
 *
 *   - On success, you can redirect back to a "View Article" page
 *     or show a success message.
 *
 * ============================================================
 * 7. SUMMARY
 *
 *   - The existing Prisma models for `articles` and `article_sections`
 *     naturally fit a scenario where each article has an array of typed
 *     sections, plus arrays for tags, citations, contributors, etc.
 *
 *   - The sample create/update logic can be adapted to your
 *     desired style (bulk replace vs. incremental updates).
 *
 *   - Just keep the field name mapping in mind:
 *       front-end "mediaUrl" -> DB "media_url"
 *       front-end "mediaSubtext" -> DB "media_subtext"
 *       ...
 *
 * With this setup, your "Article Edit" page can seamlessly
 * create or edit multi-section articles, stored in your
 * `articles` and `article_sections` tables.
 */
```