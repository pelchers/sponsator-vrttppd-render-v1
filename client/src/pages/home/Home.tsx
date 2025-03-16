import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Our Platform</h1>
      <p className="mb-6">This is a demo of the profile management system.</p>
      
      <div className="flex gap-4 mb-16">
        <Link to="/login">
          <Button>Login</Button>
        </Link>
        <Link to="/signup">
          <Button variant="outline">Sign Up</Button>
        </Link>
        <Link to="/profile/1">
          <Button variant="secondary">View Profile</Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">Explore Our Platform</h2>
        <p className="text-xl mb-8">
          Discover amazing content, connect with others, and share your ideas.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-250 hover:scale-105">
            <h2 className="text-2xl font-semibold mb-4">Articles</h2>
            <p className="mb-4">Explore in-depth articles on various topics.</p>
            <Link 
              to="/article" 
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-green-500 transition-all duration-250"
            >
              Browse Articles
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-250 hover:scale-105">
            <h2 className="text-2xl font-semibold mb-4">Projects</h2>
            <p className="mb-4">Check out featured projects from our community.</p>
            <Link 
              to="/project" 
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-green-500 transition-all duration-250"
            >
              View Projects
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-lg transition-all duration-250 hover:scale-105">
          <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
          <p className="mb-6">
            Create an account to contribute articles, share projects, and connect with others.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/register" 
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-green-500 transition-all duration-250"
            >
              Sign Up
            </Link>
            <Link 
              to="/login" 
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-green-500 transition-all duration-250"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 