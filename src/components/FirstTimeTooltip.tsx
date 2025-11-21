import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

const FirstTimeTooltip = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem("hasSeenFeedTooltip");
    if (!hasSeenTooltip) {
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem("hasSeenFeedTooltip", "true");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg">Welcome to CleanLink! 👋</h3>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>📱 <strong>Scroll</strong> to see civic issues in your area</p>
          <p>👍 <strong>Upvote</strong> important problems</p>
          <p>➕ <strong>Tap the + button</strong> to report a new issue</p>
          <p>🏆 <strong>Earn Civic Points</strong> when issues get resolved!</p>
        </div>

        <Button onClick={handleClose} className="w-full">
          Got it!
        </Button>
      </div>
    </div>
  );
};

export default FirstTimeTooltip;
