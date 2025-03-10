import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from '@/api/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo/Home */}
            <div className="flex-shrink-0 flex items-center">
              <Button variant="ghost" onClick={() => navigate('/')}>
                Home
              </Button>
            </div>
            
            {/* Main Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-2">
              <Button variant="ghost" onClick={() => navigate('/projects')}>
                Projects
              </Button>
              <Button variant="ghost" onClick={() => navigate('/article')}>
                Articles
              </Button>
              <Button variant="ghost" onClick={() => navigate('/post')}>
                Posts
              </Button>
              <Button variant="ghost" onClick={() => navigate('/explore')}>
                Explore
              </Button>
            </div>
          </div>

          <div className="flex items-center">
            {userId ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">Menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`/profile/${userId}`)}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/profile/${userId}/edit`)}>
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Projects</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/projects')}>
                    My Projects
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/projects/new')}>
                    Create Project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Articles</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/article')}>
                    My Articles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/article/edit/new')}>
                    Create Article
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Posts</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/post')}>
                    My Posts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/post/edit/new')}>
                    Create Post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 