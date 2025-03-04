import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/home/Home'
import Login from '../pages/auth/Login'
import ProfilePage from '../pages/profile/profile'
import ProfileEditPage from '../pages/profile/editprofile'
import Layout from '../components/layout/layout'

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
    path: "profile/:id",
    element: <ProfilePage />,
  },
  {
    path: "profile/:id/edit",
    element: <ProfileEditPage />,
  },
]) 