import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleAuthTest() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkGoogleScript = () => {
      if (window.google) {
        setIsLoaded(true);
        console.log('Google Identity Services loaded successfully');
      } else {
        setError('Google Identity Services not loaded');
      }
    };

    // Check if already loaded
    if (window.google) {
      checkGoogleScript();
    } else {
      // Wait for script to load
      const timer = setTimeout(checkGoogleScript, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const testGoogleAuth = () => {
    if (!window.google) {
      setError('Google Identity Services not available');
      return;
    }

    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      console.log('Client ID:', clientId);
      
      window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: (response: any) => {
          console.log('OAuth response:', response);
          if (response.error) {
            setError(`OAuth error: ${response.error}`);
          } else {
            console.log('OAuth success!');
            setError(null);
          }
        },
      }).requestAccessToken();
    } catch (err: any) {
      setError(`Test error: ${err.message}`);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Google Auth Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p><strong>Google Script Loaded:</strong> {isLoaded ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Client ID:</strong> {import.meta.env.VITE_GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing'}</p>
        </div>
        
        {error && (
          <div className="p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <Button 
          onClick={testGoogleAuth}
          disabled={!isLoaded}
          className="w-full"
        >
          Test Google OAuth
        </Button>
      </CardContent>
    </Card>
  );
}