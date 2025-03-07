import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Home from '../pages/home/Home'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/signup'
import ProfilePage from '../pages/profile/profile'
import ProfileEditPage from '../pages/profile/editprofile'

// Import project pages directly with full path
import ProjectsListPage from '../pages/project/projectslist'
import ProjectPage from '../pages/project/project'
import ProjectEditPage from '../pages/project/editproject'
import TestPage from '../pages/test'

export const router = createBrowserRouter([
  {
    path: "/",
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
])

export default router 