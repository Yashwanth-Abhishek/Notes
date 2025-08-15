import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GlitchText from '@/components/GlitchText';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/notebooks');
      } else {
        navigate('/auth');
      }
    }
  }, [user, loading, navigate]);

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
          className="text-4xl font-bold tracking-tight"
        >
          Notes
        </GlitchText>
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-primary rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
