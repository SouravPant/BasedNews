import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBaseAuth, useMiniKit } from "@/hooks/useMiniKit";
import { Wallet, LogIn, CheckCircle } from "lucide-react";

export function BaseAuthIntegration() {
  const { isInBaseApp, user } = useMiniKit();
  const { signInWithBase, isAuthenticated } = useBaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authResult, setAuthResult] = useState<any>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithBase();
      setAuthResult(result);
      
      if (result.success) {
        // Handle successful authentication
        console.log('Successfully authenticated with Base App');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInBaseApp) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect with Base
          </CardTitle>
          <CardDescription>
            This app works best in the Base App environment with native wallet integration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} disabled={isLoading} className="w-full">
            {isLoading ? 'Connecting...' : 'Sign In with Wallet'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Connected to Base App
          </CardTitle>
          <CardDescription>
            Welcome back, {user.displayName || user.username || 'User'}!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Your wallet is connected and ready to use.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-5 w-5" />
          Base App Authentication
        </CardTitle>
        <CardDescription>
          Sign in with your Base App account to access personalized features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSignIn} disabled={isLoading} className="w-full">
          {isLoading ? 'Signing In...' : 'Sign In with Base App'}
        </Button>
        
        {authResult && !authResult.success && (
          <div className="mt-2 text-sm text-red-600">
            Authentication failed: {authResult.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}