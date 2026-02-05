import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { googleAuthService, GoogleUser } from '@/services/googleAuth';

interface AuthContextType {
  user: User | GoogleUser | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isGoogleUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | GoogleUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Google Auth
    const initGoogleAuth = async () => {
      try {
        await googleAuthService.initialize();
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
      }
    };

    initGoogleAuth();

    // Set up auth state listener for Supabase (if needed for other features)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isGoogleUser) {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isGoogleUser) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Check for stored Google user
    const storedGoogleUser = localStorage.getItem('googleUser');
    if (storedGoogleUser) {
      try {
        const googleUser = JSON.parse(storedGoogleUser);
        setUser(googleUser);
        setIsGoogleUser(true);
      } catch (error) {
        localStorage.removeItem('googleUser');
      }
    }

    setLoading(false);

    return () => subscription.unsubscribe();
  }, [isGoogleUser]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const googleUser = await googleAuthService.signIn();
      
      // Store user info in localStorage
      localStorage.setItem('googleUser', JSON.stringify(googleUser));
      
      setUser(googleUser);
      setIsGoogleUser(true);
      setSession(null); // Clear Supabase session
      
      toast({
        title: "Signed in successfully",
        description: `Welcome, ${googleUser.name}!`,
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (isGoogleUser) {
        googleAuthService.signOut();
        localStorage.removeItem('googleUser');
        setIsGoogleUser(false);
      } else {
        const { error } = await supabase.auth.signOut();
        if (error) {
          toast({
            title: "Sign out failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
      }
      
      setUser(null);
      setSession(null);
      
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    isGoogleUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}