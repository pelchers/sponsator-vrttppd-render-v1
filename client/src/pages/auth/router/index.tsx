import { createBrowserRouter } from 'react-router-dom'
import Home from '../../home/Home'
import Login from '../Login'
import Signup from '../signup'
import ProfilePage from '../../profile/profile'
import ProfileEditPage from '../../profile/editprofile'
import Layout from '../../../components/layout/layout'

// Remove the duplicate Layout component definition
// const Layout = ({ children }: { children: React.ReactNode }) => (
//   <div className="min-h-screen bg-background">
//     {/* You can add header, navigation, footer, etc. here */}
//     <main>{children}</main>
//   </div>
// )

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
    path: "/signup",
    element: <Layout><Signup /></Layout>,
  },
  {
    path: "profile/:id",
    element: <Layout><ProfilePage /></Layout>,
  },
  {
    path: "profile/:id/edit",
    element: <Layout><ProfileEditPage /></Layout>,
  },
]) 