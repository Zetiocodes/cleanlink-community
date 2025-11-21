import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const FloatingActionButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/create-post")}
      size="lg"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 rounded-full shadow-lg hover:shadow-xl transition-all h-12 w-12 sm:h-14 sm:w-14 p-0 z-40 touch-manipulation"
    >
      <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
    </Button>
  );
};

export default FloatingActionButton;
