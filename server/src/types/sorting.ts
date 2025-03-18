export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}

export const validSortFields = [
  'title',
  'username',
  'project_name',
  'likes_count',
  'follows_count',
  'watches_count',
  'created_at',
  'updated_at'
];

export const contentTypeFieldMap = {
  users: {
    title: 'username'
  },
  projects: {
    title: 'project_name'
  },
  articles: {
    title: 'title'
  },
  posts: {
    title: 'title'
  }
}; 