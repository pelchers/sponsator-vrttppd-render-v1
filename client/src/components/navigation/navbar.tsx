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

  // Updated button and dropdown styles
  const navButtonClass = "transition-all duration-250 hover:scale-105 font-medium";
  const dropdownItemClass = "transition-all duration-250 hover:bg-spring-light text-black rounded-md";
  const dropdownLabelClass = "text-lg font-bold text-black";
  const dropdownSeparatorClass = "bg-gray-200";

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
                variant="spring" 
                onClick={() => navigate('/projects')}
                className={navButtonClass}
              >
                Projects
              </Button>
              <Button 
                variant="spring" 
                onClick={() => navigate('/about')}
                className={navButtonClass}
              >
                About
              </Button>
              <Button 
                variant="spring" 
                onClick={() => navigate('/article')}
                className={navButtonClass}
              >
                Articles
              </Button>
              <Button 
                variant="spring" 
                onClick={() => navigate('/post')}
                className={navButtonClass}
              >
                Posts
              </Button>
              <Button 
                variant="spring" 
                onClick={() => navigate('/explore')}
                className={navButtonClass}
              >
                Explore
              </Button>
              <Button 
                variant="spring" 
                onClick={() => navigate('/mystuff')}
                className={navButtonClass}
              >
                My Stuff
              </Button>
              <Button 
                variant="spring" 
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
              <Button 
                variant="spring" 
                onClick={() => navigate('/testimonials')}
                className={navButtonClass}
              >
                Testimonials
              </Button>
            </div>
          </div>

          <div className="flex items-center">
            {userId ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="spring"
                    className={`${navButtonClass} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                  >
                    Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-64 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2"
                >
                  <DropdownMenuLabel className={dropdownLabelClass}>
                    Navigation
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => navigate('/')}
                    className={dropdownItemClass}
                  >
                    Landing Page
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/about')}
                    className={dropdownItemClass}
                  >
                    About
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/testimonials')}
                    className={dropdownItemClass}
                  >
                    Testimonials
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className={dropdownSeparatorClass} />
                  
                  <DropdownMenuLabel className={dropdownLabelClass}>
                    My Account
                  </DropdownMenuLabel>
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
                  <DropdownMenuSeparator className={dropdownSeparatorClass} />
                  
                  <DropdownMenuLabel className={dropdownLabelClass}>
                    Messages
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => navigate('/messages')}
                    className={dropdownItemClass}
                  >
                    My Messages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className={dropdownSeparatorClass} />
                  
                  <DropdownMenuLabel className={dropdownLabelClass}>
                    Projects
                  </DropdownMenuLabel>
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
                  <DropdownMenuSeparator className={dropdownSeparatorClass} />
                  
                  <DropdownMenuLabel className={dropdownLabelClass}>
                    Articles
                  </DropdownMenuLabel>
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
                  <DropdownMenuSeparator className={dropdownSeparatorClass} />
                  
                  <DropdownMenuLabel className={dropdownLabelClass}>
                    Posts
                  </DropdownMenuLabel>
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
                  <DropdownMenuSeparator className={dropdownSeparatorClass} />
                  
                  <DropdownMenuLabel className={dropdownLabelClass}>
                    Content
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => navigate('/explore')}
                    className={dropdownItemClass}
                  >
                    Explore
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/mystuff')}
                    className={dropdownItemClass}
                  >
                    My Stuff
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate(`/portfolio/${userId}`)}
                    className={dropdownItemClass}
                  >
                    Portfolio
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className={dropdownSeparatorClass} />
                  
                  <DropdownMenuLabel className={dropdownLabelClass}>
                    Account
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => navigate('/login')}
                    className={dropdownItemClass}
                  >
                    Sign In
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/register')}
                    className={dropdownItemClass}
                  >
                    Sign Up
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className={dropdownSeparatorClass} />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 hover:bg-red-100 rounded-md transition-all duration-250"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2 items-center">
                <Button 
                  variant="spring" 
                  onClick={() => navigate('/login')}
                  className={navButtonClass}
                >
                  Login
                </Button>
                <Button 
                  variant="spring" 
                  onClick={() => navigate('/register')}
                  className="transition-all duration-200 hover:scale-105"
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