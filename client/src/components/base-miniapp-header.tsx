import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { useMiniKit, useBaseApp, useBaseSocial } from "@/hooks/useMiniKit";
import { Share2, X, Plus, ExternalLink } from "lucide-react";

export function BaseMiniAppHeader() {
  const { isInBaseApp, user } = useMiniKit();
  const { addToBaseApp, close } = useBaseApp();
  const { openUrl } = useBaseSocial();

  if (!isInBaseApp) {
    return null; // Don't show Base App header if not in Base App
  }

  const handleAddFrame = async () => {
    const result = await addToBaseApp();
    if (result.success) {
      // Could show success toast here
      console.log('Added to Base App successfully');
    }
  };

  const handleOpenInBrowser = () => {
    openUrl(window.location.origin);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Base App
          </Badge>
        </div>
        
        {user && (
          <div className="text-sm text-muted-foreground">
            Welcome, {user.displayName || user.username || 'User'}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddFrame}
          className="h-8 px-3"
        >
          <Plus className="h-4 w-4 mr-1" />
          Save
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenInBrowser}
          className="h-8 px-3"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={close}
          className="h-8 px-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}