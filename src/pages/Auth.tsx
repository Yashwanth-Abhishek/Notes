import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, FileText, Search, Archive } from 'lucide-react';
import GlitchText from '@/components/GlitchText';

export default function Auth() {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/notebooks');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/library-background.jpg.jpg')`
        }}
      />
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
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
            className="text-4xl font-bold tracking-tight"
          >
            Notes
          </GlitchText>
          <p className="text-xl text-muted-foreground">
            Your digital notebook for organized thoughts
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 my-8">
          <div className="text-center space-y-2">
            <BookOpen className="w-8 h-8 text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Multiple Notebooks</p>
          </div>
          <div className="text-center space-y-2">
            <Search className="w-8 h-8 text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Smart Search</p>
          </div>
          <div className="text-center space-y-2">
            <FileText className="w-8 h-8 text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Rich Text Notes</p>
          </div>
          <div className="text-center space-y-2">
            <Archive className="w-8 h-8 text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Archive System</p>
          </div>
        </div>

        {/* Sign In Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Notes</CardTitle>
            <CardDescription>
              Sign in with your Google account to start organizing your thoughts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={signInWithGoogle}
              className="w-full"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">
          Secure, fast, and beautifully designed for your workflow
        </p>
      </div>
    </div>
  );
}