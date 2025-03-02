import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings } from "lucide-react"
import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="h-16 px-6 flex items-center">
        <Link to="/" className="font-bold text-xl">
          Logo
        </Link>
        
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Link to="/landing" className="w-full">Landing Page</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/profile" className="w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/profile/edit" className="w-full">Edit Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/article" className="w-full">Articles List</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/article/edit/new" className="w-full">New Article</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/post/new" className="w-full">New Post</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/project/edit" className="w-full">Edit Project</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
