import { ChevronUp, ChevronDown, MessageSquare, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Post {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  category: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  timeAgo: string;
}

interface PostRowProps {
  post: Post;
  onClick: () => void;
}

const PostRow = ({ post, onClick }: PostRowProps) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Garbage: "bg-orange-100 text-orange-800",
      Road: "bg-blue-100 text-blue-800",
      Water: "bg-cyan-100 text-cyan-800",
      Trees: "bg-green-100 text-green-800",
      Electricity: "bg-yellow-100 text-yellow-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.Other;
  };

  return (
    <div className="border-b border-border py-3 hover:bg-accent/50 transition-colors">
      <div className="flex gap-2 sm:gap-3 px-2 sm:px-3">
        {/* Upvote Column */}
        <div className="flex flex-col items-center gap-1 pt-1 min-w-[40px]">
          <button className="p-1 hover:bg-accent rounded touch-manipulation">
            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <span className="text-xs sm:text-sm font-medium">{post.upvotes}</span>
          <button className="p-1 hover:bg-accent rounded touch-manipulation">
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={onClick}>
          <h3 className="font-semibold text-sm sm:text-base mb-1 cursor-pointer hover:text-primary line-clamp-2">
            {post.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
            {post.description}
          </p>
          
          {/* Meta Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground flex-wrap">
            <Badge variant="secondary" className={`${getCategoryColor(post.category)} text-xs px-1.5 py-0`}>
              {post.category}
            </Badge>
            <span className="flex items-center gap-0.5 sm:gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[100px] sm:max-w-none">{post.location}</span>
            </span>
            <span>{post.timeAgo}</span>
            <span className="flex items-center gap-0.5 sm:gap-1">
              <MessageSquare className="w-3 h-3" />
              {post.commentCount}
            </span>
          </div>
        </div>

        {/* Thumbnail */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded flex-shrink-0 cursor-pointer touch-manipulation"
            onClick={onClick}
          />
        )}
      </div>
    </div>
  );
};

export default PostRow;
