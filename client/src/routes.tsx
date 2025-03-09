import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/home/home';
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';
import ProfilePage from './pages/profile/profile';
import ProfileEditPage from './pages/profile/profileedit';
import ProjectsPage from './pages/project/projects';
import ProjectPage from './pages/project/project';
import ProjectEditPage from './pages/project/projectedit';
import ArticlesPage from './pages/article/articleslist';
import ArticlePage from './pages/article/article';
import ArticleEditPage from './pages/article/editarticle';
import PostsPage from './pages/post/postslist';
import PostPage from './pages/post/post';
import PostEditPage from './pages/post/editpost';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><HomePage /></Layout>,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/profile/:id',
    element: <Layout><ProfilePage /></Layout>,
  },
  {
    path: '/profile/:id/edit',
    element: <Layout><ProfileEditPage /></Layout>,
  },
  {
    path: '/projects',
    element: <Layout><ProjectsPage /></Layout>,
  },
  {
    path: '/projects/:id',
    element: <Layout><ProjectPage /></Layout>,
  },
  {
    path: '/projects/new',
    element: <Layout><ProjectEditPage /></Layout>,
  },
  {
    path: '/projects/:id/edit',
    element: <Layout><ProjectEditPage /></Layout>,
  },
  {
    path: '/article',
    element: <Layout><ArticlesPage /></Layout>,
  },
  {
    path: '/article/:id',
    element: <Layout><ArticlePage /></Layout>,
  },
  {
    path: '/article/edit/new',
    element: <Layout><ArticleEditPage /></Layout>,
  },
  {
    path: '/article/edit/:id',
    element: <Layout><ArticleEditPage /></Layout>,
  },
  // Post routes in correct order
  {
    path: '/post',
    element: <Layout><PostsPage /></Layout>,
  },
  {
    path: '/post/edit/new',  // More specific route first
    element: <Layout><PostEditPage /></Layout>,
  },
  {
    path: '/post/edit/:id',  // More specific parameterized route next
    element: <Layout><PostEditPage /></Layout>,
  },
  {
    path: '/post/:id',       // General parameterized route last
    element: <Layout><PostPage /></Layout>,
  },
  // Add this route for debugging
  {
    path: '/debug',
    element: <div>Debug Route Working</div>,
  },
]);

export default router; 