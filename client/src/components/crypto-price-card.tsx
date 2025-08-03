import { Card } from "@/components/ui/card";
import { Cryptocurrency } from "@shared/schema";

interface CryptoPriceCardProps {
  cryptocurrency: Cryptocurrency;
  onClick?: () => void;
}

export function CryptoPriceCard({ cryptocurrency, onClick }: CryptoPriceCardProps) {
  const formatPrice = (price?: string | null) => {
    if (!price) return "$0.00";
    const num = parseFloat(price);
    if (num >= 1) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 8
    }).format(num);
  };

  const formatVolume = (volume?: string | null) => {
    if (!volume) return "$0";
    const num = parseFloat(volume);
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(1)}B`;
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(1)}M`;
    }
    return `$${(num / 1e3).toFixed(1)}K`;
  };

  const formatPercentage = (percentage?: string | null) => {
    if (!percentage) return "0.00%";
    const num = parseFloat(percentage);
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const isPositive = cryptocurrency.priceChangePercentage24h && parseFloat(cryptocurrency.priceChangePercentage24h) >= 0;

  return (
    <Card 
      className="bg-based-surface rounded-xl border-border p-4 hover:border-primary/20 transition-colors font-semibold cursor-pointer hover:bg-primary/5"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3 mb-3">
        {cryptocurrency.image ? (
          <img 
            src={cryptocurrency.image} 
            alt={cryptocurrency.name}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold ${cryptocurrency.image ? 'hidden' : ''}`}>
          {cryptocurrency.symbol?.slice(0, 3)}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{cryptocurrency.name}</h3>
          <p className="text-xs text-muted-foreground font-mono">{cryptocurrency.symbol}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="font-mono text-lg font-semibold text-foreground">
          {formatPrice(cryptocurrency.currentPrice)}
        </div>
        <div className="flex items-center space-x-2">
          <span 
            className={`font-medium ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {formatPercentage(cryptocurrency.priceChangePercentage24h)}
          </span>
          <svg 
            className={`w-4 h-4 ${
              isPositive ? 'text-green-500 rotate-0' : 'text-red-500 rotate-180'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5" />
          </svg>
        </div>
        <div className="text-xs text-muted-foreground">
          <span>Vol: </span>
          <span className="font-mono">{formatVolume(cryptocurrency.volume24h)}</span>
        </div>
      </div>
    </Card>
  );
}
