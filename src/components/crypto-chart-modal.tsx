import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CryptoChart } from './crypto-chart';
import { Cryptocurrency } from '@shared/schema';
import { X, TrendingUp } from 'lucide-react';

interface CryptoChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cryptocurrency: Cryptocurrency | null;
}

interface ChartData {
  coinId: string;
  days: number;
  data: Array<{
    time: string;
    price: number;
  }>;
}

export function CryptoChartModal({ isOpen, onClose, cryptocurrency }: CryptoChartModalProps) {
  const [selectedDays, setSelectedDays] = useState<number>(7);

  const { data: chartData, isLoading, error } = useQuery<ChartData>({
    queryKey: ['/api/cryptocurrencies', cryptocurrency?.id, 'chart', selectedDays],
    queryFn: () => 
      fetch(`/api/cryptocurrencies/${cryptocurrency?.id}/chart?days=${selectedDays}`)
        .then(res => res.json()),
    enabled: isOpen && !!cryptocurrency?.id,
  });

  const timeRangeOptions = [
    { label: '24H', days: 1 },
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
    { label: '1Y', days: 365 },
  ];

  if (!cryptocurrency) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full h-[85vh] sm:h-[600px] bg-card border-border text-card-foreground p-3 sm:p-6">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-4">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            {cryptocurrency?.image && (
              <img 
                src={cryptocurrency.image} 
                alt={cryptocurrency.name}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg sm:text-xl font-bold text-card-foreground truncate">
                {cryptocurrency.name} Chart
              </DialogTitle>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Current Price: ${parseFloat(cryptocurrency.currentPrice || '0').toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: parseFloat(cryptocurrency.currentPrice || '0') < 1 ? 6 : 2,
                })}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
          {timeRangeOptions.map((option) => (
            <Button
              key={option.days}
              variant={selectedDays === option.days ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDays(option.days)}
              className="text-xs px-2 py-1 sm:px-3 sm:py-2 h-7 sm:h-8"
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Chart Content */}
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="w-full h-full flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="flex-1 w-full" />
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">Failed to load chart data</p>
                <p className="text-muted-foreground text-sm">Please try again later</p>
              </div>
            </div>
          ) : chartData?.data?.length ? (
            <CryptoChart
              data={chartData.data}
              coinName={cryptocurrency.name}
              coinSymbol={cryptocurrency.symbol}
              days={selectedDays}
              onTimeframeChange={setSelectedDays}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No chart data available</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}