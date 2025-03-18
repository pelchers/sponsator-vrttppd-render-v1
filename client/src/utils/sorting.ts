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

  const mapping = fieldMappings[entityType];
  if (!mapping) return results;

  return [...results].sort((a, b) => {
    const field = sortBy === 'alpha' ? mapping.title : mapping[sortOption.field];
    const aValue = a[field as keyof T];
    const bValue = b[field as keyof T];

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