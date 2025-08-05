import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

interface NewsFilterProps {
  onFilterChange: (source: string | null) => void;
  activeFilter: string | null;
}

const NEWS_SOURCES = [
  { id: 'crypto-news', label: 'Crypto News', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'coindesk', label: 'CoinDesk', color: 'bg-green-500/20 text-green-400' },
  { id: 'cointelegraph', label: 'CoinTelegraph', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'reddit', label: 'r/cryptocurrency', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'twitter', label: 'Crypto Twitter', color: 'bg-cyan-500/20 text-cyan-400' }
];

export function NewsFilter({ onFilterChange, activeFilter }: NewsFilterProps) {
  const handleFilterClick = (sourceId: string) => {
    if (activeFilter === sourceId) {
      onFilterChange(null); // Toggle off if same filter clicked
    } else {
      onFilterChange(sourceId); // Set new filter
    }
  };

  const clearFilter = () => {
    onFilterChange(null);
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <div className="flex items-center space-x-1">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter by source:</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {NEWS_SOURCES.map((source) => (
          <Button
            key={source.id}
            variant={activeFilter === source.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterClick(source.id)}
            className={`text-xs transition-all ${
              activeFilter === source.id 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            {source.label}
            {activeFilter === source.id && (
              <X className="w-3 h-3 ml-1" />
            )}
          </Button>
        ))}
        
        {activeFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilter}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear Filter
          </Button>
        )}
      </div>
    </div>
  );
}