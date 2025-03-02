import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Our Platform</h1>
      <p className="mb-6">This is a demo of the profile management system.</p>
      
      <div className="flex gap-4">
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
    </div>
  );
} 