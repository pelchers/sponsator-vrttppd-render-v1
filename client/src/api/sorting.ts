import { SortOrder } from '@/types/sorting';

interface SortParams {
  contentType: string;
  sortBy: string;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

export async function getSortedContent({
  contentType,
  sortBy = 'created_at',
  sortOrder = 'desc',
  page = 1,
  limit = 12
}: SortParams) {
  const params = new URLSearchParams({
    contentType,
    sortBy,
    sortOrder,
    page: page.toString(),
    limit: limit.toString()
  });

  const response = await fetch(`/api/content/sort?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch sorted content');
  }

  return response.json();
} 