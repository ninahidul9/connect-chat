import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-xl font-medium text-foreground mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Go home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
