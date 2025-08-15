import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen, FileText } from 'lucide-react';
import GlitchText from '@/components/GlitchText';

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
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <BookOpen className="w-16 h-16 text-primary" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <FileText className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>
        </div>
        <GlitchText
          speed={1}
          enableShadows={true}
          enableOnHover={true}
          className="text-4xl font-bold tracking-tight mb-4"
        >
          Notes
        </GlitchText>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
        <a href="/" className="text-primary hover:text-primary/80 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
