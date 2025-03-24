import UserCard from '@/components/cards/UserCard';
import ProjectCard from '@/components/cards/ProjectCard';
import ArticleCard from '@/components/cards/ArticleCard';
import PostCard from '@/components/cards/PostCard';
import { SortSelect } from '@/components/sort/SortSelect';
import { SortOrder } from '@/components/sort/SortOrder';
import { sortResults } from '@/utils/sorting';

interface ResultsGridProps {
  results: {
    users: any[];
    projects: any[];
    articles: any[];
    posts: any[];
  };
  loading: boolean;
  contentTypes: string[];
  likeStatuses?: {
    posts: Record<string, boolean>;
    articles: Record<string, boolean>;
    projects: Record<string, boolean>;
  };
  followStatuses?: {
    articles: Record<string, boolean>;
  };
  watchStatuses?: {
    articles: Record<string, boolean>;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string) => void;
  onSortOrderChange?: (order: 'asc' | 'desc') => void;
}

export default function ResultsGrid({ 
  results, 
  loading, 
  contentTypes, 
  likeStatuses,
  followStatuses,
  watchStatuses,
  sortBy = '',
  sortOrder = 'desc',
  onSortChange,
  onSortOrderChange
}: ResultsGridProps) {
  // Ensure all arrays exist
  const safeResults = {
    users: results.users || [],
    posts: results.posts || [],
    articles: results.articles || [],
    projects: results.projects || []
  };
  
  // Determine which content types to show
  const showAll = contentTypes.includes('all');
  const showUsers = showAll || contentTypes.includes('users');
  const showProjects = showAll || contentTypes.includes('projects');
  const showArticles = showAll || contentTypes.includes('articles');
  const showPosts = showAll || contentTypes.includes('posts');
  
  // Combine all results based on selected content types
  const allResults = [
    ...(showUsers ? safeResults.users.map(item => ({ ...item, type: 'user' })) : []),
    ...(showProjects ? safeResults.projects.map(item => ({ ...item, type: 'project' })) : []),
    ...(showArticles ? safeResults.articles.map(item => ({ ...item, type: 'article' })) : []),
    ...(showPosts ? safeResults.posts.map(item => ({ ...item, type: 'post' })) : [])
  ];
  
  // Sort results if sort options are provided
  const sortedResults = {
    users: showUsers ? sortResults(safeResults.users, sortBy, sortOrder, 'users') : [],
    projects: showProjects ? sortResults(safeResults.projects, sortBy, sortOrder, 'projects') : [],
    articles: showArticles ? sortResults(safeResults.articles, sortBy, sortOrder, 'articles') : [],
    posts: showPosts ? sortResults(safeResults.posts, sortBy, sortOrder, 'posts') : []
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (allResults.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">No results found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Add sorting controls */}
      <div className="flex justify-end items-center gap-2 mb-4">
        <SortSelect 
          value={sortBy}
          onValueChange={onSortChange || (() => {})}
          className="w-[180px]"
        />
        <SortOrder 
          order={sortOrder}
          onChange={onSortOrderChange || (() => {})}
        />
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {showUsers && sortedResults.users.map((user, index) => (
          <div key={`user-${user.id || index}`} className="col-span-1">
            <UserCard user={user} />
          </div>
        ))}
        {showProjects && sortedResults.projects.map((project, index) => (
          <div key={`project-${project.id || index}`} className="col-span-1">
            <ProjectCard
              key={project.id}
              project={{
                ...project,
                user_profile_image_url: project.user_profile_image_url,
                user_profile_image_upload: project.user_profile_image_upload,
                user_profile_image_display: project.user_profile_image_display
              }}
            />
          </div>
        ))}
        {showArticles && sortedResults.articles.map((article, index) => (
          <div key={`article-${article.id || index}`} className="col-span-1">
            <ArticleCard 
              article={article} 
              userHasLiked={likeStatuses?.articles[article.id] || false}
              userIsFollowing={followStatuses?.articles[article.id] || false}
              userIsWatching={watchStatuses?.articles[article.id] || false}
            />
          </div>
        ))}
        {showPosts && sortedResults.posts.map((post, index) => (
          <div key={`post-${post.id || index}`} className="col-span-1">
            <PostCard 
              post={post} 
              userHasLiked={likeStatuses?.posts[post.id] || false}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 