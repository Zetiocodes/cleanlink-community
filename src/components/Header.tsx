import { Search, Plus, Bell, User, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "@/components/ProfileMenu";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const navigate = useNavigate();

  // Mock user data - replace with actual auth context
  const user = {
    username: "Rahul Kumar",
    region: "South Delhi, Delhi",
    points: 485,
    level: "Active Contributor",
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-base sm:text-lg">CleanLink</span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search problems, locations..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/notifications")}
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/create-post")}
              className="hidden sm:flex text-xs sm:text-sm h-8 sm:h-9"
            >
              Report
            </Button>

            <ProfileMenu
              points={user.points}
              level={user.level}
              username={user.username}
              region={user.region}
            >
              <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors touch-manipulation">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </button>
            </ProfileMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
