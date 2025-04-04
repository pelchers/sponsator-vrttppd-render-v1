import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { Home } from '@/pages/home'
import { Login, Signup } from '@/pages/auth'
import { Profile as ProfilePage } from '@/pages/profile'
import { ProfileEdit as ProfileEditPage } from '@/pages/profile'
import { MessagesListPage, ChatPage } from '@/pages/messages'

// Import project pages directly with full path
import { ProjectsListPage, ProjectPage, ProjectEditPage } from '@/pages/project'
import TestPage from '@/pages/test'
import { ArticlesPage, ArticleViewPage, ArticleEditPage } from '@/pages/article'
// Import post pages
import { PostsPage, PostPage, PostEditPage } from '@/pages/post'
import { Explore as ExplorePage } from '@/pages/explore'
import { Likes as LikesPage } from '@/pages/likes'
import MyStuffPage from '@/pages/mystuff/mystuff'
import PortfolioPage from '@/pages/portfolio/portfolio'
import { Landing } from '@/pages/landing'
import About from '@/pages/about/about'
import Testimonials from '@/pages/testimonials/testimonials'
// Import suggestions pages
import SuggestionsPage from '@/pages/suggestions'
import SuggestionDetail from '@/pages/suggestions/suggestion-detail'

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><Landing /></Layout>,
  },
  {
    path: "/home",
    element: <Layout><Home /></Layout>,
  },
  {
    path: "/login",
    element: <Layout><Login /></Layout>,
  },
  {
    path: "/register",
    element: <Layout><Signup /></Layout>,
  },
  {
    path: "/profile/:id",
    element: <Layout><ProfilePage /></Layout>,
  },
  {
    path: "/profile/:id/edit",
    element: <Layout><ProfileEditPage /></Layout>,
  },
  // Messages routes
  {
    path: "/messages",
    element: <Layout><MessagesListPage /></Layout>,
  },
  {
    path: "/messages/:chatId",
    element: <Layout><ChatPage /></Layout>,
  },
  // Project routes with leading slash
  {
    path: "/projects",
    element: <Layout><ProjectsListPage /></Layout>,
  },
  {
    path: "/projects/new",
    element: <Layout><ProjectEditPage /></Layout>,
  },
  {
    path: "/projects/:id",
    element: <Layout><ProjectPage /></Layout>,
  },
  {
    path: "/projects/:id/edit",
    element: <Layout><ProjectEditPage /></Layout>,
  },
  {
    path: "/test",
    element: <Layout><TestPage /></Layout>,
  },
  {
    path: '/article',
    element: <Layout><ArticlesPage /></Layout>,
  },
  {
    path: '/article/edit/new',
    element: <Layout><ArticleEditPage /></Layout>,
  },
  {
    path: '/article/edit/:id',
    element: <Layout><ArticleEditPage /></Layout>,
  },
  {
    path: '/article/:id',
    element: <Layout><ArticleViewPage /></Layout>,
  },
  // Post routes - note the order is important
  {
    path: '/post',
    element: <Layout><PostsPage /></Layout>,
  },
  {
    path: '/post/edit/new',
    element: <Layout><PostEditPage /></Layout>,
  },
  {
    path: '/post/edit/:id',
    element: <Layout><PostEditPage /></Layout>,
  },
  {
    path: '/post/:id',
    element: <Layout><PostPage /></Layout>,
  },
  {
    path: '/explore',
    element: <Layout><ExplorePage /></Layout>,
  },
  {
    path: '/likes',
    element: <Layout><LikesPage /></Layout>,
  },
  {
    path: '/mystuff',
    element: <Layout><MyStuffPage /></Layout>,
  },
  {
    path: '/portfolio',
    element: <Layout><PortfolioPage /></Layout>,
  },
  {
    path: '/portfolio/:userId',
    element: <Layout><PortfolioPage /></Layout>,
  },
  {
    path: '/about',
    element: <Layout><About /></Layout>,
  },
  {
    path: '/testimonials',
    element: <Layout><Testimonials /></Layout>,
  },
  // Add suggestions routes
  {
    path: '/suggestions',
    element: <Layout><SuggestionsPage /></Layout>,
  },
  {
    path: '/suggestions/:id',
    element: <Layout><SuggestionDetail /></Layout>,
  }
])

export default router 