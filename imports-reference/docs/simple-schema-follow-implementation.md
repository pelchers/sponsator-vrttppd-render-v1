```ts
/**
 * HOW FOLLOW TOGGLING WORKS (With Increment/Decrement Counts)
 *
 * This example illustrates how to let users "follow" a project and track follower counts.
 *
 * 1. **User Clicks "Follow"**:
 *    - We check if a follow record already exists (follower_id + followed_type="project" + followed_id=project_id).
 *    - If it DOES NOT exist, we create one (the user is now following).
 *      - Then we call `prisma.projects.update()` with `{ increment: 1 }` to increase `project_followers` by 1.
 *
 * 2. **User Clicks "Unfollow"** (when they are already following):
 *    - We find the existing follow record, and if it exists, we delete it.
 *    - Then we call `prisma.projects.update()` with `{ decrement: 1 }` to reduce `project_followers` by 1.
 *
 * 3. **Atomic Updates**:
 *    - Prisma’s `{ increment: 1 }` and `{ decrement: 1 }` are atomic. 
 *      They run an UPDATE query that safely adds or subtracts from the column’s current value, 
 *      preventing race conditions if multiple users follow/unfollow at the same time.
 *
 * 4. **Return "following: true/false"**:
 *    - The server response tells the client whether the user is now following, 
 *      so the front end can update button text accordingly ("Follow" -> "Unfollow").
 *
 * You can adapt this toggle logic for "likes," "watches," or any record-based action 
 * where you need to increment/decrement a count column in your database.
 */

import { Request, Response } from "express"
import { prisma } from "../prismaClient" // Adjust import to your actual Prisma client

export async function toggleFollowProject(req: Request, res: Response) {
  try {
    const { follower_id, project_id } = req.body

    // 1) Check for an existing follow record
    const existing = await prisma.follows.findFirst({
      where: {
        follower_id,
        followed_type: "project",
        followed_id: project_id,
      },
    })

    if (existing) {
      // Already following -> remove the follow record
      await prisma.follows.delete({ where: { id: existing.id } })

      // Decrement the project's follower count by 1
      await prisma.projects.update({
        where: { id: project_id },
        data: { project_followers: { decrement: 1 } },
      })

      return res.json({
        following: false,
        message: "Follow removed (count decremented)",
      })
    } else {
      // Not following yet -> create a follow record
      const newFollow = await prisma.follows.create({
        data: {
          follower_id,
          followed_type: "project",
          followed_id: project_id,
        },
      })

      // Increment the project's follower count by 1
      await prisma.projects.update({
        where: { id: project_id },
        data: { project_followers: { increment: 1 } },
      })

      return res.json({
        following: true,
        followId: newFollow.id,
        message: "Follow added (count incremented)",
      })
    }
  } catch (error) {
    console.error("Error toggling follow:", error)
    return res.status(500).json({
      following: null,
      error: "Failed to toggle follow",
    })
  }
}
```

**Copy/Paste Explanation:**

- **`existing`**: We search `follows` for the user+project combo.
  - **If found**, user is already following → we **delete** → **decrement** the `project_followers` count.
  - **If not found**, user is not following → we **create** → **increment** the `project_followers` count.
- **Atomic Counting**: The `{ increment: 1 }` and `{ decrement: 1 }` in Prisma are atomic updates. This avoids race conditions if many people follow/unfollow simultaneously. 
- **Return**: The response tells the front end if `following: true` or `false`, so you can show “Follow” or “Unfollow” in your UI.