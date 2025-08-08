import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, Filter, TrendingUp, NewspaperIcon, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays } from "date-fns";

interface SearchResult {
  type: 'crypto' | 'news';
  id: string;
  title: string;
  subtitle: string;
  match: string;
}

interface SearchFilters {
  dateRange: 'all' | '1d' | '7d' | '30d';
  sentiment: 'all' | 'bullish' | 'bearish' | 'neutral';
  category: 'all' | 'crypto' | 'news';
  sortBy: 'relevance' | 'date' | 'price';
}

interface SearchBarProps {
  cryptocurrencies: any[];
  newsArticles: any[];
  onResultClick: (result: SearchResult) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  placeholder?: string;
}

export function SearchBar({ 
  cryptocurrencies = [], 
  newsArticles = [], 
  onResultClick,
  onFiltersChange,
  placeholder = "Search cryptocurrencies and news..." 
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: 'all',
    sentiment: 'all',
    category: 'all',
    sortBy: 'relevance'
  });
  
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 1) return [];

    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase();
    const currentDate = new Date();

    // Filter by date range
    const getDateCutoff = () => {
      switch (filters.dateRange) {
        case '1d': return subDays(currentDate, 1);
        case '7d': return subDays(currentDate, 7);
        case '30d': return subDays(currentDate, 30);
        default: return null;
      }
    };

    const dateCutoff = getDateCutoff();

    // Search cryptocurrencies
    if (filters.category === 'all' || filters.category === 'crypto') {
      cryptocurrencies.forEach((crypto) => {
        const nameMatch = crypto.name?.toLowerCase().includes(searchTerm);
        const symbolMatch = crypto.symbol?.toLowerCase().includes(searchTerm);
        
        if (nameMatch || symbolMatch) {
          const priceChange = parseFloat(crypto.priceChangePercentage24h || '0');
          const trend = priceChange >= 0 ? 'bullish' : 'bearish';
          
          results.push({
            type: 'crypto',
            id: crypto.id,
            title: crypto.name,
            subtitle: `${crypto.symbol?.toUpperCase()} • $${parseFloat(crypto.currentPrice || '0').toLocaleString()} • ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
            match: nameMatch ? crypto.name : crypto.symbol
          });
        }
      });
    }

    // Search news articles
    if (filters.category === 'all' || filters.category === 'news') {
      newsArticles.forEach((article) => {
        const titleMatch = article.title?.toLowerCase().includes(searchTerm);
        const descMatch = article.description?.toLowerCase().includes(searchTerm);
        
        // Apply date filter
        if (dateCutoff && article.publishedAt) {
          const articleDate = new Date(article.publishedAt);
          if (articleDate < dateCutoff) return;
        }
        
        // Apply sentiment filter
        if (filters.sentiment !== 'all' && article.sentiment !== filters.sentiment) {
          return;
        }
        
        if (titleMatch || descMatch) {
          results.push({
            type: 'news',
            id: article.id,
            title: article.title,
            subtitle: `${article.source || 'News'} • ${article.sentiment ? article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1) : 'Neutral'}`,
            match: titleMatch ? article.title : article.description
          });
        }
      });
    }

    // Sort results
    const sortedResults = results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'relevance':
          // Prioritize exact matches and crypto over news
          const aExact = a.match.toLowerCase() === searchTerm;
          const bExact = b.match.toLowerCase() === searchTerm;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          if (a.type === 'crypto' && b.type === 'news') return -1;
          if (a.type === 'news' && b.type === 'crypto') return 1;
          return 0;
        case 'date':
          return b.id.localeCompare(a.id); // Assuming newer IDs come later
        default:
          return 0;
      }
    });

    return sortedResults.slice(0, 10); // Limit to 10 results
  }, [query, cryptocurrencies, newsArticles, filters]);

  // Update filters and notify parent
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && searchResults[selectedIndex]) {
            handleResultClick(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, searchResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(value.length >= 1);
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result);
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative w-full max-w-lg">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length >= 1 && setIsOpen(true)}
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
        
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="px-3">
              <Filter className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="crypto">Cryptocurrencies</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Date Range</Label>
                <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="1d">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Sentiment</Label>
                <Select value={filters.sentiment} onValueChange={(value) => updateFilter('sentiment', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="bullish">Bullish</SelectItem>
                    <SelectItem value="bearish">Bearish</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isOpen && searchResults.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border-border shadow-lg max-h-80 overflow-y-auto">
          <div className="p-2">
            {searchResults.map((result, index) => (
              <div
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  index === selectedIndex ? 'bg-muted' : 'hover:bg-muted'
                }`}
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