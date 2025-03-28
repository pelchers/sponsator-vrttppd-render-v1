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

      {/* Results sections */}
      <div className="space-y-6">
        {/* Users Section */}
        {showUsers && sortedResults.users.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Users</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showUsers && sortedResults.users.map((user, index) => (
                <UserCard 
                  key={`user-${user.id || index}`} 
                  user={{
                    ...user,
                    work_status: user.work_status || null,
                    seeking: user.seeking || null,
                    website_links: user.website_links || [],
                    skills: user.skills || [],
                    expertise: user.expertise || [],
                    interest_tags: user.interest_tags || [],
                    experience_tags: user.experience_tags || [],
                    education_tags: user.education_tags || [],
                    target_audience: user.target_audience || [],
                    solutions_offered: user.solutions_offered || [],
                    career_experience: user.career_experience || 0,
                    social_media_followers: user.social_media_followers || 0,
                    currency: user.currency || 'USD',
                    profile_visibility: user.profile_visibility || 'public',
                    search_visibility: user.search_visibility ?? true,
                    notification_preferences_email: user.notification_preferences_email ?? true,
                    notification_preferences_push: user.notification_preferences_push ?? true,
                    notification_preferences_digest: user.notification_preferences_digest ?? true,
                    account_status: user.account_status || 'active'
                  }} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {showProjects && sortedResults.projects.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showProjects && sortedResults.projects.map((project, index) => (
                <ProjectCard
                  key={`project-${project.id || index}`}
                  project={{
                    ...project,
                    project_image_url: project.project_image_url || null,
                    project_image_upload: project.project_image_upload || null,
                    project_image_display: project.project_image_display || 'url',
                    project_tags: project.project_tags || [],
                    industry_tags: project.industry_tags || [],
                    technology_tags: project.technology_tags || [],
                    skills_required: project.skills_required || [],
                    expertise_needed: project.expertise_needed || [],
                    target_audience: project.target_audience || [],
                    solutions_offered: project.solutions_offered || [],
                    website_links: project.website_links || [],
                    likes_count: project.likes_count || 0,
                    follows_count: project.follows_count || 0,
                    watches_count: project.watches_count || 0,
                    featured: project.featured || false,
                    seeking_creator: project.seeking_creator || false,
                    seeking_brand: project.seeking_brand || false,
                    seeking_freelancer: project.seeking_freelancer || false,
                    seeking_contractor: project.seeking_contractor || false,
                    project_visibility: project.project_visibility || 'public',
                    search_visibility: project.search_visibility ?? true,
                    notification_preferences_email: project.notification_preferences_email ?? true,
                    notification_preferences_push: project.notification_preferences_push ?? true,
                    notification_preferences_digest: project.notification_preferences_digest ?? true,
                    currency: project.currency || 'USD'
                  }}
                  userHasLiked={likeStatuses?.projects[project.id] || false}
                  userIsFollowing={followStatuses?.projects[project.id] || false}
                  userIsWatching={watchStatuses?.projects[project.id] || false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Articles Section */}
        {showArticles && sortedResults.articles.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showArticles && sortedResults.articles.map((article, index) => (
                <ArticleCard
                  key={`article-${article.id || index}`}
                  article={{
                    ...article,
                    article_image_url: article.article_image_url || null,
                    article_image_upload: article.article_image_upload || null,
                    article_image_display: article.article_image_display || 'url',
                    tags: article.tags || [],
                    citations: article.citations || [],
                    contributors: article.contributors || [],
                    related_media: article.related_media || [],
                    likes_count: article.likes_count || 0,
                    follows_count: article.follows_count || 0,
                    watches_count: article.watches_count || 0,
                    featured: article.featured || false,
                    article_sections: article.article_sections || []
                  }}
                  userHasLiked={likeStatuses?.articles[article.id] || false}
                  userIsFollowing={followStatuses?.articles[article.id] || false}
                  userIsWatching={watchStatuses?.articles[article.id] || false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Posts Section */}
        {showPosts && sortedResults.posts.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showPosts && sortedResults.posts.map((post, index) => (
                <PostCard
                  key={`post-${post.id || index}`}
                  post={{
                    ...post,
                    post_image_url: post.post_image_url || null,
                    post_image_upload: post.post_image_upload || null,
                    post_image_display: post.post_image_display || 'url',
                    tags: post.tags || [],
                    likes_count: post.likes_count || 0,
                    follows_count: post.follows_count || 0,
                    watches_count: post.watches_count || 0,
                    comments: post.comments || 0,
                    featured: post.featured || false
                  }}
                  userHasLiked={likeStatuses?.posts[post.id] || false}
                  userIsFollowing={followStatuses?.posts[post.id] || false}
                  userIsWatching={watchStatuses?.posts[post.id] || false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 