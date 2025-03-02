import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Menu, User, Home, Edit, LogIn, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('userId');
    setIsLoggedIn(!!(token && id));
    setUserId(id);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container mx-auto h-16 px-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl flex items-center gap-2">
          <Home className="h-5 w-5" />
          Profile App
        </Link>
        
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link to={userId ? `/profile/${userId}` : "/login"} className="hidden md:block">
                <Button variant="ghost">My Profile</Button>
              </Link>
              <Link to={userId ? `/profile/${userId}/edit` : "/login"} className="hidden md:block">
                <Button variant="ghost">Edit Profile</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden md:block">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup" className="hidden md:block">
                <Button variant="ghost">Sign Up</Button>
              </Link>
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Link to="/" className="w-full flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </DropdownMenuItem>
              
              {isLoggedIn ? (
                <>
                  <DropdownMenuItem>
                    <Link to={userId ? `/profile/${userId}` : "/login"} className="w-full flex items-center gap-2">
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to={userId ? `/profile/${userId}/edit` : "/login"} className="w-full flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <span className="w-full flex items-center gap-2">
                      <LogIn className="h-4 w-4 rotate-180" />
                      Logout
                    </span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>
                    <Link to="/login" className="w-full flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/signup" className="w-full flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
} 