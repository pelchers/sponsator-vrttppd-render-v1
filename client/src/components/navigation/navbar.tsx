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

  // Common button styles for nav items
  const navButtonClass = "transition-all duration-250 hover:scale-105 hover:text-green-500 font-medium";
  const dropdownItemClass = "transition-all duration-250 hover:bg-green-50 hover:text-green-500 cursor-pointer";

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo/Home - Updated to always go to landing page */}
            <div className="flex-shrink-0 flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className={`${navButtonClass} font-honk text-4xl tracking-wide`}
              >
                Home
              </Button>
            </div>
            
            {/* Main Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-1 items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/projects')}
                className={navButtonClass}
              >
                Projects
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/article')}
                className={navButtonClass}
              >
                Articles
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/post')}
                className={navButtonClass}
              >
                Posts
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/explore')}
                className={navButtonClass}
              >
                Explore
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/likes')}
                className={navButtonClass}
              >
                Likes
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/mystuff')}
                className={navButtonClass}
              >
                My Stuff
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  if (userId) {
                    navigate(`/portfolio/${userId}`);
                  } else {
                    navigate('/portfolio');
                  }
                }}
                className={navButtonClass}
              >
                Portfolio
              </Button>
            </div>
          </div>

          <div className="flex items-center">
            {userId ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost"
                    className={navButtonClass}
                  >
                    Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel className="font-semibold">Navigation</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => navigate('/')}
                    className={dropdownItemClass}
                  >
                    Landing Page
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate(`/profile/${userId}`)}
                    className={dropdownItemClass}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate(`/profile/${userId}/edit`)}
                    className={dropdownItemClass}
                  >
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="font-semibold">Messages</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => navigate('/messages')}
                    className={dropdownItemClass}
                  >
                    My Messages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="font-semibold">Projects</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => navigate('/projects')}
                    className={dropdownItemClass}
                  >
                    My Projects
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/projects/new')}
                    className={dropdownItemClass}
                  >
                    Create Project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="font-semibold">Articles</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => navigate('/article')}
                    className={dropdownItemClass}
                  >
                    My Articles
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/article/edit/new')}
                    className={dropdownItemClass}
                  >
                    Create Article
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="font-semibold">Posts</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => navigate('/post')}
                    className={dropdownItemClass}
                  >
                    My Posts
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/post/edit/new')}
                    className={dropdownItemClass}
                  >
                    Create Post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate('/likes')}
                    className={dropdownItemClass}
                  >
                    My Likes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2 items-center">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  className={navButtonClass}
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  className="bg-blue-500 hover:bg-green-500 text-white transition-all duration-200 hover:scale-105"
                >
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