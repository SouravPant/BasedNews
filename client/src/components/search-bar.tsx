import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  type: 'crypto' | 'news';
  id: string;
  title: string;
  subtitle: string;
  match: string;
}

interface SearchBarProps {
  cryptocurrencies: any[];
  newsArticles: any[];
  onResultClick: (result: SearchResult) => void;
  placeholder?: string;
}

export function SearchBar({ 
  cryptocurrencies = [], 
  newsArticles = [], 
  onResultClick,
  placeholder = "Search cryptocurrencies and news..." 
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];

    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase();

    // Search cryptocurrencies
    cryptocurrencies.forEach((crypto) => {
      const nameMatch = crypto.name?.toLowerCase().includes(searchTerm);
      const symbolMatch = crypto.symbol?.toLowerCase().includes(searchTerm);
      
      if (nameMatch || symbolMatch) {
        results.push({
          type: 'crypto',
          id: crypto.id,
          title: crypto.name,
          subtitle: `${crypto.symbol} • $${parseFloat(crypto.currentPrice || '0').toLocaleString()}`,
          match: nameMatch ? crypto.name : crypto.symbol
        });
      }
    });

    // Search news articles
    newsArticles.forEach((article) => {
      const titleMatch = article.title?.toLowerCase().includes(searchTerm);
      const descMatch = article.description?.toLowerCase().includes(searchTerm);
      
      if (titleMatch || descMatch) {
        results.push({
          type: 'news',
          id: article.id,
          title: article.title,
          subtitle: article.source,
          match: titleMatch ? article.title : article.description
        });
      }
    });

    return results.slice(0, 8); // Limit to 8 results
  }, [query, cryptocurrencies, newsArticles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 2);
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result);
    setQuery("");
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 bg-based-surface border-border focus:border-primary"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isOpen && searchResults.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border-border shadow-lg max-h-80 overflow-y-auto">
          <div className="p-2">
            {searchResults.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        result.type === 'crypto' 
                          ? 'border-blue-500/50 text-blue-400' 
                          : 'border-green-500/50 text-green-400'
                      }`}
                    >
                      {result.type === 'crypto' ? 'Crypto' : 'News'}
                    </Badge>
                  </div>
                  <p className="font-medium text-card-foreground text-sm truncate">
                    {result.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {result.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {isOpen && query.length >= 2 && searchResults.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border-border shadow-lg">
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
          </div>
        </Card>
      )}
    </div>
  );
}