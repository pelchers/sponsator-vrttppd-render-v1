import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/Layout/Layout'
import Home from '@/pages/home/Home'
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/signup'
import ProfilePage from '@/pages/profile/profile'
import ProfileEditPage from '@/pages/profile/editprofile'
import MessagesListPage from '@/pages/messages/MessagesListPage'
import ChatPage from '@/pages/messages/ChatPage'

// Import project pages directly with full path
import ProjectsListPage from '@/pages/project/projectslist'
import ProjectPage from '@/pages/project/project'
import ProjectEditPage from '@/pages/project/editproject'
import TestPage from '@/pages/test'
import ArticlesPage from '@/pages/article/articleslist'
import ArticleViewPage from '@/pages/article/article'
import ArticleEditPage from '@/pages/article/editarticle'
// Import post pages
import PostsPage from '@/pages/post/postslist'
import PostPage from '@/pages/post/post'
import PostEditPage from '@/pages/post/editpost'
import ExplorePage from '@/pages/explore/Explore'
import LikesPage from '@/pages/likes/Likes'
import MyStuffPage from '@/pages/mystuff/mystuff'
import PortfolioPage from '@/pages/portfolio/portfolio'
import Landing from '@/pages/landing/Landing'
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