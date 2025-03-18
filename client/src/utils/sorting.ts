import { sortOptions } from '@/components/sort/SortSelect';

type EntityType = 'users' | 'projects' | 'articles' | 'posts';

const fieldMappings: Record<EntityType, Record<string, string>> = {
  users: {
    title: 'username',
    likes_count: 'likes_count',
    follows_count: 'follows_count',
    watches_count: 'watches_count',
    created_at: 'created_at',
    updated_at: 'updated_at'
  },
  projects: {
    title: 'project_name',
    likes_count: 'likes_count',
    follows_count: 'follows_count',
    watches_count: 'watches_count',
    created_at: 'created_at',
    updated_at: 'updated_at'
  },
  articles: {
    title: 'title',
    likes_count: 'likes_count',
    follows_count: 'follows_count',
    watches_count: 'watches_count',
    created_at: 'created_at',
    updated_at: 'updated_at'
  },
  posts: {
    title: 'title',
    likes_count: 'likes_count',
    follows_count: 'follows_count',
    watches_count: 'watches_count',
    created_at: 'created_at',
    updated_at: 'updated_at'
  }
};

export function sortResults<T extends { id: string }>(
  results: T[],
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  entityType: EntityType
): T[] {
  if (!sortBy) return results;

  const sortOption = sortOptions.find(opt => opt.id === sortBy);
  if (!sortOption) return results;

  // Create a copy of the array to avoid mutating the original
  return [...results].sort((a, b) => {
    // Determine which field to sort by based on entity type and sort option
    let aValue, bValue;
    
    // Handle special case for alphabetical sorting
    if (sortBy === 'alpha') {
      // Map the title field based on entity type
      switch(entityType) {
        case 'users':
          aValue = a.username;
          bValue = b.username;
          break;
        case 'projects':
          aValue = a.title || a.project_name;
          bValue = b.title || b.project_name;
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }
    } else {
      // For other sort options, use the field directly
      const field = sortOption.field as keyof T;
      aValue = a[field];
      bValue = b[field];
    }

    // Handle different data types
    switch (sortOption.type) {
      case 'string':
        return sortOrder === 'asc' 
          ? String(aValue || '').localeCompare(String(bValue || ''))
          : String(bValue || '').localeCompare(String(aValue || ''));
      case 'number':
        return sortOrder === 'asc'
          ? Number(aValue || 0) - Number(bValue || 0)
          : Number(bValue || 0) - Number(aValue || 0);
      case 'date':
        const dateA = aValue ? new Date(aValue).getTime() : 0;
        const dateB = bValue ? new Date(bValue).getTime() : 0;
        return sortOrder === 'asc'
          ? dateA - dateB
          : dateB - dateA;
      default:
        return 0;
    }
  });
} 