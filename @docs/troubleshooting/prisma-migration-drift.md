# Resolving Prisma Migration Drift Issues

## The Issue
We encountered a "drift" between:
1. The actual database schema
2. The local migration files
3. Prisma's migration history

Specifically:
```bash
Drift detected: Your database schema is not in sync with your migration history.
```

The error showed that certain migrations were applied to the database but missing from our local migrations directory:
```
The following migration(s) are applied to the database but missing from the local migrations directory: 
20250319212810_add_featured_field
```

## Root Cause
This happened because:
1. A migration was applied to the database (`add_featured_field`)
2. The migration file was deleted or lost from the local `/migrations` directory
3. The database still had the changes from that migration (the `featured` columns)
4. New migrations were trying to be created while this inconsistency existed

## Quick Resolution Steps

1. First, check migration status:
```bash
npx prisma migrate status
```

2. If you see "migrations have not yet been applied" or "missing from local migrations directory":

3. In development, reset the database:
```bash
npx prisma migrate reset
```

4. Then create your new migration:
```bash
npx prisma migrate dev --name your_migration_name
```

## Important Notes

1. **NEVER** do `migrate reset` in production
2. Always commit migration files to git
3. Coordinate migration changes with team members
4. Back up data before resetting if needed

## Prevention

To prevent this issue:
1. Never manually delete migration files
2. Always use `git` to track migration files
3. Communicate with team when adding migrations
4. Run `prisma migrate status` before creating new migrations

## When to Use This Fix

Use this fix when you see:
1. "Drift detected" errors
2. Missing migration files errors
3. Inconsistencies between schema and database
4. Shadow database errors related to migrations

Remember: This solution involves resetting the database, so only use it in development environments! 