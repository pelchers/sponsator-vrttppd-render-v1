# Prisma Migrations Guide

## Overview

This document explains how to use Prisma migrations to update your database schema, with a specific focus on adding like, follow, and watch count fields to all main tables.

🌟 **New Dev Friendly Explanation**:
Prisma migrations are like version control for your database. They allow you to make changes to your database structure (like adding new fields) in a safe, controlled way that can be tracked and applied consistently across different environments.

## Understanding Prisma Migrations

### What are Migrations?

Migrations are a way to:
1. Track changes to your database schema
2. Apply those changes in a consistent way
3. Roll back changes if needed
4. Collaborate with team members on database changes

### Migration Workflow

The basic workflow for creating and applying migrations is:

1. **Modify your schema.prisma file** - Add, remove, or change models and fields
2. **Generate a migration** - Create SQL that will update the database
3. **Apply the migration** - Execute the SQL to update the database structure
4. **Update the Prisma client** - Generate an updated client that knows about the new schema

## Adding Count Fields to All Tables

### Current Schema Structure

Our current schema has several main tables (users, posts, articles, projects, comments) and a `likes` table that tracks likes across these entities:

```prisma
model likes {
  id          String   @id @default(uuid())
  user_id     String
  entity_type String   // e.g., "post", "project", "article", "comment", "user"
  entity_id   String   // The ID of the item being liked
  created_at  DateTime @default(now())
  users       users?   @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("likes")
}
```

Some tables already have count fields (e.g., `posts.likes`), but we want to ensure all main tables have consistent count fields for likes, follows, and watches.

### Schema Changes

We'll add the following fields to all main tables:

```prisma
// For users table
model users {
  // existing fields...
  likes_count       Int @default(0)  // How many likes this user has received
  follows_count     Int @default(0)  // How many followers this user has
  watches_count     Int @default(0)  // How many people are watching this user
}

// For posts table
model posts {
  // existing fields...
  likes_count       Int @default(0)
  follows_count     Int @default(0)
  watches_count     Int @default(0)
}

// Similar for projects, articles, comments
```

### Creating the Migration

To create a migration for these changes:

1. Update your `schema.prisma` file with the new fields
2. Run the migration command:

```bash
cd server
npx prisma migrate dev --name add_count_fields
```

This will:
- Generate a new migration file in `prisma/migrations/`
- Apply the migration to your development database
- Update the Prisma client

### Example Migration File

The generated migration file will look something like this:

```sql
-- AlterTable
ALTER TABLE "users" ADD COLUMN "likes_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "follows_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "watches_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN "likes_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "posts" ADD COLUMN "follows_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "posts" ADD COLUMN "watches_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN "likes_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "projects" ADD COLUMN "follows_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "projects" ADD COLUMN "watches_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "articles" ADD COLUMN "likes_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "articles" ADD COLUMN "follows_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "articles" ADD COLUMN "watches_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "comments" ADD COLUMN "likes_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "comments" ADD COLUMN "follows_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "comments" ADD COLUMN "watches_count" INTEGER NOT NULL DEFAULT 0;
```

## Data Preservation

When adding new fields with default values, your existing data will be preserved. The migration will:

1. Add the new columns to each table
2. Set the default value (0) for all existing rows
3. Keep all existing data intact

This is a safe operation that won't affect your current data.

## Updating Service Methods

After adding these fields, you'll need to update your service methods to maintain the count fields:

```typescript
// Update incrementLikeCount and decrementLikeCount to handle all entity types
export async function incrementLikeCount(entityType: string, entityId: string) {
  let result;
  
  switch (entityType) {
    case 'user':
      result = await prisma.users.update({
        where: { id: entityId },
        data: { likes_count: { increment: 1 } }
      });
      break;
    case 'post':
      result = await prisma.posts.update({
        where: { id: entityId },
        data: { likes_count: { increment: 1 } }
      });
      break;
    case 'article':
      result = await prisma.articles.update({
        where: { id: entityId },
        data: { likes_count: { increment: 1 } }
      });
      break;
    case 'project':
      result = await prisma.projects.update({
        where: { id: entityId },
        data: { likes_count: { increment: 1 } }
      });
      break;
    case 'comment':
      result = await prisma.comments.update({
        where: { id: entityId },
        data: { likes_count: { increment: 1 } }
      });
      break;
    default:
      console.log(`[LIKE SERVICE] Unknown entity type: ${entityType}, no count updated`);
      return null;
  }
  
  return result;
}

// Similar updates for decrementLikeCount, incrementFollowCount, etc.
```

## Backfilling Existing Counts

If you already have likes, follows, or watches in your database, you'll want to backfill the count fields:

```typescript
// Example backfill script
async function backfillLikeCounts() {
  // Get all entity types
  const entityTypes = ['user', 'post', 'article', 'project', 'comment'];
  
  for (const entityType of entityTypes) {
    // Get all likes for this entity type
    const likes = await prisma.likes.groupBy({
      by: ['entity_id'],
      where: { entity_type: entityType },
      _count: { entity_id: true }
    });
    
    // Update each entity with its count
    for (const like of likes) {
      const entityId = like.entity_id;
      const count = like._count.entity_id;
      
      switch (entityType) {
        case 'user':
          await prisma.users.update({
            where: { id: entityId },
            data: { likes_count: count }
          });
          break;
        case 'post':
          await prisma.posts.update({
            where: { id: entityId },
            data: { likes_count: count }
          });
          break;
        // Similar for other entity types
      }
    }
    
    console.log(`Backfilled ${entityType} like counts`);
  }
}

// Run the backfill
backfillLikeCounts()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

## Best Practices for Prisma Migrations

1. **Always review migration files** before applying them to production
2. **Test migrations** in a development or staging environment first
3. **Back up your database** before applying migrations to production
4. **Keep migrations small and focused** - one conceptual change per migration
5. **Use descriptive names** for your migrations
6. **Commit migration files** to version control
7. **Document complex migrations** with comments

## Common Migration Issues and Solutions

### 1. Migration Conflicts

**Issue**: Multiple developers create migrations that conflict

**Solution**: 
- Coordinate database changes with your team
- Pull and apply migrations before creating new ones
- Resolve conflicts by manually editing migration files

### 2. Failed Migrations

**Issue**: Migration fails to apply

**Solution**:
- Check the error message for specific issues
- Fix the issue in your schema.prisma file
- Use `prisma migrate dev --create-only` to create a new migration without applying it
- Edit the migration file if needed
- Apply with `prisma migrate dev`

### 3. Production Migrations

**Issue**: Safely applying migrations to production

**Solution**:
- Use `prisma migrate deploy` for production environments
- Schedule migrations during low-traffic periods
- Have a rollback plan ready

## Summary

Adding like, follow, and watch count fields to all tables is a straightforward migration that:

1. Preserves all existing data
2. Adds consistent count fields across all entity tables
3. Improves query performance for displaying counts
4. Enables efficient sorting by popularity

By following the migration process outlined here, you can safely update your database schema while maintaining data integrity and application functionality. 