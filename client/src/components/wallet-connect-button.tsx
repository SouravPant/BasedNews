import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet, useMiniKit } from "@/hooks/useMiniKit";
import { Wallet, LogIn, CheckCircle, ExternalLink, Copy, LogOut, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WalletConnectButton() {
  const { wallet, connectWallet, disconnectWallet, isConnected } = useWallet();
  const { isInBaseApp, user, signInWithBase } = useMiniKit();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      if (isInBaseApp) {
        // Use Base App native authentication
        const result = await signInWithBase();
        if (result.success) {
          toast({
            title: "Connected to Base App",
            description: `Welcome back, ${result.user?.displayName || 'User'}!`,
          });
        } else {
          throw new Error(result.error || 'Failed to authenticate');
        }
      } else {
        // Connect wallet directly
        await connectWallet();
        toast({
          title: "Wallet Connected",
          description: "Your wallet has been successfully connected.",
        });
      }
    } catch (error) {
      console.error('Connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 8453: return 'Base';
      case 137: return 'Polygon';
      default: return `Chain ${chainId}`;
    }
  };

  if (isConnected && wallet) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {isInBaseApp ? 'Base App Connected' : 'Wallet Connected'}
          </CardTitle>
          <CardDescription>
            {user?.displayName && `Welcome back, ${user.displayName}!`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Address</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  {formatAddress(wallet.address)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {wallet.chainId && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network</span>
                <Badge variant="outline">
                  {getChainName(wallet.chainId)}
                </Badge>
              </div>
            )}
            
            {wallet.balance && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Balance</span>
                <span className="text-sm font-mono">
                  {wallet.balance} ETH
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://basescan.org/address/${wallet.address}`, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Explorer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isInBaseApp ? <Zap className="h-5 w-5 text-blue-500" /> : <Wallet className="h-5 w-5" />}
          {isInBaseApp ? 'Connect with Base App' : 'Connect Wallet'}
        </CardTitle>
        <CardDescription>
          {isInBaseApp 
            ? 'Sign in with your Base App account for the best experience'
            : 'Connect your Coinbase Wallet or other Web3 wallet to get started'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleConnect} 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading ? (
            'Connecting...'
          ) : (
            <>
              <LogIn className="h-4 w-4 mr-2" />
              {isInBaseApp ? 'Sign In with Base' : 'Connect Wallet'}
            </>
          )}
        </Button>
        
        {!isInBaseApp && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">
              Supported wallets:
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="text-xs">Coinbase Wallet</Badge>
              <Badge variant="outline" className="text-xs">MetaMask</Badge>
              <Badge variant="outline" className="text-xs">WalletConnect</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}