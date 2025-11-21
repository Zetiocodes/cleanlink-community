import { useState } from "react";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import RegionSelector from "@/components/RegionSelector";
import PostRow from "@/components/PostRow";
import TrendingSidebar from "@/components/TrendingSidebar";
import BottomNav from "@/components/BottomNav";
import FloatingActionButton from "@/components/FloatingActionButton";
import FirstTimeTooltip from "@/components/FirstTimeTooltip";
import { dummyIssues } from "@/lib/dummyData";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const categories = ["All", "Garbage", "Road", "Water", "Trees", "Electricity", "Other"];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  const filteredIssues = dummyIssues.filter((issue) => {
    const matchesCategory = selectedCategory === "All" || issue.category === selectedCategory;
    return matchesCategory;
  });

  const posts = filteredIssues.map(issue => ({
    ...issue,
    commentCount: Math.floor(Math.random() * 100) + 5,
  }));

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-20 md:pb-0">
      <FirstTimeTooltip />
      <Header />
      
      {/* Region Strip */}
      <div className="border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-2">
          <RegionSelector />
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:flex md:gap-6">
        {/* Main Feed */}
        <div className="flex-1 max-w-3xl mx-auto">
          {/* Search Bar - Mobile */}
          <div className="md:hidden mb-3 sm:mb-4">
            <div 
              className="relative cursor-pointer"
              onClick={() => navigate('/search')}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search problems, locations..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm touch-manipulation"
                readOnly
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors touch-manipulation",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Posts Feed */}
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostRow
                  key={post.id}
                  post={post}
                  onClick={() => navigate(`/post/${post.id}`)}
                />
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <p className="text-muted-foreground mb-2">No posts here yet</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to report in your area!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Trending Sidebar - Desktop */}
        <div className="hidden md:block w-80 flex-shrink-0">
          <TrendingSidebar />
        </div>
      </div>

      {/* FAB */}
      <FloatingActionButton />

      {/* Bottom Navigation - Mobile */}
      <BottomNav />
    </div>
  );
};

export default Home;
