# Card Data Flow Implementation Guide

This guide documents how we implemented complete data flow for UserCard, ArticleCard, ProjectCard, and PostCard components, ensuring all schema fields are properly passed through the system.

## Overview

We updated the data flow to ensure all fields from the Prisma schema are:
1. Selected in the explore service
2. Transformed with proper defaults
3. Passed through ResultsGrid
4. Available in card components

## Implementation Pattern

For each card type (User, Article, Project, Post), we followed this pattern:

### 1. Schema Analysis
- Examined Prisma schema for all available fields
- Identified required and optional fields
- Noted field types and default values

### 2. ExploreService Updates
```typescript
// Add fields to select
const entities = await prisma.entityType.findMany({
  select: {
    // Basic fields
    id: true,
    title: true,
    // Image fields
    entity_image_url: true,
    entity_image_upload: true,
    entity_image_display: true,
    // Array fields with defaults
    tags: true,
    skills: true,
    // Status fields
    featured: true,
    // Interaction counts
    likes_count: true,
    follows_count: true,
    watches_count: true
  }
});

// Transform with defaults
const transformedEntities = entities.map(entity => ({
  ...entity,
  tags: entity.tags || [],
  likes_count: entity.likes_count || 0,
  // ... other defaults
}));
```

### 3. ResultsGrid Updates
```typescript
{showEntities && sortedResults.entities.map((entity) => (
  <EntityCard
    key={`entity-${entity.id}`}
    entity={{
      ...entity,
      // Provide defaults for all fields
      tags: entity.tags || [],
      likes_count: entity.likes_count || 0
    }}
    userHasLiked={likeStatuses?.entities[entity.id] || false}
    userIsFollowing={followStatuses?.entities[entity.id] || false}
    userIsWatching={watchStatuses?.entities[entity.id] || false}
  />
))}
```

### 4. Card Interface Updates
```typescript
interface EntityCardProps {
  entity: {
    // Required fields
    id: string;
    user_id: string;
    // Optional fields with types
    title?: string;
    description?: string;
    // Image fields
    entity_image_url?: string;
    entity_image_upload?: string;
    entity_image_display?: string;
    // Array fields
    tags?: string[];
    // Status fields
    featured?: boolean;
    // Counts
    likes_count?: number;
    follows_count?: number;
    watches_count?: number;
  };
  // Interaction props
  userHasLiked?: boolean;
  userIsFollowing?: boolean;
  userIsWatching?: boolean;
}
```

## Benefits of Complete Data Flow

1. **Type Safety**
   - Full TypeScript interfaces for all props
   - Proper type checking throughout the flow
   - Better IDE support and autocomplete

2. **Data Consistency**
   - Consistent default values
   - Predictable data structure
   - No undefined errors

3. **Future Proofing**
   - All schema fields available in components
   - Easy to add new UI elements
   - No need to update data flow for new features

4. **Better Debug Support**
   - Clear data structure
   - Easy to track data flow
   - Consistent error handling

## Example: Adding New Fields

When adding new fields:

1. Add to Prisma schema
2. Add to explore service select
3. Add to transform function with defaults
4. Add to interface
5. Add to ResultsGrid defaults
6. Use in component

## Testing Flow

1. Check explore service response
2. Verify ResultsGrid props
3. Confirm card component receives data
4. Validate default values
5. Test interaction states

## Common Patterns

1. **Default Values**
```typescript
field: entity.field || defaultValue
arrays: entity.array || []
counts: entity.count || 0
booleans: entity.flag ?? false
```

2. **Interaction States**
```typescript
userHasLiked={statuses?.entities[id] || false}
```

3. **Image Fields**
```typescript
image_url: entity.image_url || null,
image_display: entity.image_display || 'url'
```

Remember: Always provide defaults and handle null/undefined cases to prevent runtime errors. 