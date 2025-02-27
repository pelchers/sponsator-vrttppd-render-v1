```ts
/**
 * ============================================================
 *        HOW TO IMPLEMENT THE "POSTS" CREATE/UPDATE FLOW
 * ============================================================
 *
 * This guide explains how to:
 *  1) Align your front-end "Post Edit Page" data with the
 *     Prisma `posts` model
 *  2) Create or update a post (including simple string arrays 
 *     for tags)
 *  3) Handle media URLs, optional fields, likes/comments counts
 *
 * ============================================================
 * 1. PRISMA SCHEMA:
 *
 *  // In schema.prisma:
 *
 *  model posts {
 *    id          String   @id @default(uuid())
 *    user_id     String
 *    title       String?
 *    mediaUrl    String?
 *    tags        String[]
 *    description String?
 *    likes       Int      @default(0)
 *    comments    Int      @default(0)
 *
 *    // Relationship to user
 *    users users @relation(fields: [user_id], references: [id], onDelete: Cascade)
 *
 *    created_at  DateTime? @default(now())
 *    updated_at  DateTime? @default(now())
 *
 *    @@map("posts")
 *  }
 *
 *  NOTE:
 *  - `tags` is a string array, perfect for comma-separated tags in 
 *    the front end.
 *  - `mediaUrl` is optional (String?), so a post may or may not 
 *    have an image/video link.
 *  - `likes` and `comments` track counts. You can increment 
 *    or decrement them when users like or comment on the post 
 *    (or do a direct count from the `likes` or `comments` table 
 *    if using the polymorphic approach).
 *
 * ============================================================
 * 2. FRONT-END STRUCTURE (Next.js Example):
 *
 *  In your "PostEditPage", you might have states like:
 *
 *    interface Post {
 *      id: string
 *      title: string
 *      mediaUrl: string
 *      tags: string[]
 *      description: string
 *    }
 *
 *    const [post, setPost] = useState<Post>({
 *      id: params.id,
 *      title: "",
 *      mediaUrl: "",
 *      tags: [],
 *      description: "",
 *    })
 *
 *  - If `params.id` is "new", user is creating a post.
 *  - Otherwise, you fetch the existing post from your API.
 *  - You capture `title`, `mediaUrl`, `tags` (split by comma), 
 *    and `description`.
 *
 * ============================================================
 * 3. CREATING A POST (Server Example)
 *
 *  Suppose you have a POST route or function:
 *
 *    import { prisma } from "../prismaClient" // adjust path as needed
 *
 *    async function createPost(req, res) {
 *      try {
 *        // For example, the user ID might come from auth
 *        const { user_id, title, mediaUrl, tags, description } = req.body
 *
 *        const newPost = await prisma.posts.create({
 *          data: {
 *            user_id,
 *            title,
 *            mediaUrl,
 *            tags,         // string array
 *            description,
 *          },
 *        })
 *
 *        return res.status(200).json({
 *          message: "Post created",
 *          postId: newPost.id,
 *        })
 *      } catch (error) {
 *        console.error(error)
 *        return res.status(500).json({ error: "Failed to create post" })
 *      }
 *    }
 *
 *  Explanation:
 *   - We store `user_id` from your auth or from the front end.
 *   - `title`, `mediaUrl`, `description` are direct string fields.
 *   - `tags` is a string[] (in the front end, you might parse from CSV).
 *
 * ============================================================
 * 4. UPDATING A POST
 *
 *    async function updatePost(req, res) {
 *      try {
 *        const { postId } = req.params
 *        const { title, mediaUrl, tags, description } = req.body
 *
 *        const updated = await prisma.posts.update({
 *          where: { id: postId },
 *          data: {
 *            title,
 *            mediaUrl,
 *            tags,
 *            description,
 *          },
 *        })
 *
 *        return res.status(200).json({ message: "Post updated", post: updated })
 *      } catch (error) {
 *        console.error(error)
 *        return res.status(500).json({ error: "Failed to update post" })
 *      }
 *    }
 *
 *  Explanation:
 *   - We replace old values with new ones. 
 *   - For `tags`, we simply pass an updated array of strings to overwrite 
 *     the old array in the DB.
 *
 * ============================================================
 * 5. OPTIONAL ENHANCEMENTS
 *
 *   - **Handling `likes` and `comments`**:
 *     - If you want to let users like or comment on the post, you can 
 *       increment `posts.likes` or `posts.comments`. 
 *     - Or store them in a separate table like `likes` or `comments` 
 *       (the “polymorphic approach”), and do a direct count. 
 *     - If you store counts in `posts`, you can do something like:
 *         await prisma.posts.update({
 *           where: { id: postId },
 *           data: { likes: { increment: 1 } },
 *         })
 *       to increment likes by 1.
 *
 *   - **User Validation**:
 *     - Ensure the `user_id` you store in `posts` is the current 
 *       authenticated user, or at least belongs to them.
 *
 *   - **Media Upload**:
 *     - If you allow file uploads instead of just a URL, 
 *       you might store the file in an S3 bucket and set `mediaUrl` 
 *       to the uploaded path.
 *
 * ============================================================
 * 6. FRONT-END TO SERVER FLOW
 *
 *   - The user opens "Post Edit Page," sets `title`, `mediaUrl`, etc.
 *   - The `tags` input is comma-separated, then split into a string array 
 *     for the DB. 
 *   - Clicking "Save" or "Update" calls a POST/PUT route with these fields.
 *   - Prisma writes them to the `posts` table. On success, 
 *     you can redirect or show a success message.
 *
 * ============================================================
 * 7. SUMMARY
 *
 *   - The `posts` model is straightforward for storing standard fields:
 *       * Title, mediaUrl, description, tags
 *       * An optional user_id foreign key
 *       * Likes & comments counts
 *   - If the user is editing an existing post, you fetch the DB record 
 *     and hydrate your form. Then a PUT route updates it.
 *   - If creating a new post, a POST route inserts a new row with your 
 *     chosen user_id and text fields.
 *   - This perfectly aligns with your “PostEditPage” code that 
 *     handles `title`, `mediaUrl`, `tags`, and `description`.
 */
```