import Navbar from "@/components/sections/navbar"
import { Link } from "react-router-dom"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to Our Platform</h1>
          <p className="text-xl mb-8">
            Discover amazing content, connect with others, and share your ideas.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Articles</h2>
              <p className="mb-4">Explore in-depth articles on various topics.</p>
              <Link 
                to="/article" 
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Browse Articles
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Projects</h2>
              <p className="mb-4">Check out featured projects from our community.</p>
              <Link 
                to="/project" 
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View Projects
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-100 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
            <p className="mb-6">
              Create an account to contribute articles, share projects, and connect with others.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                to="/auth/signup" 
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
              >
                Sign Up
              </Link>
              <Link 
                to="/auth/login" 
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 Our Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
