import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Chart from 'react-apexcharts';

interface ChartDataPoint {
  time: string;
  price: number;
}

interface CryptoChartProps {
  data: ChartDataPoint[];
  coinName: string;
  coinSymbol: string;
  days: number;
  onTimeframeChange: (days: number) => void;
}

export function CryptoChart({ data, coinName, coinSymbol, days, onTimeframeChange }: CryptoChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);


  // Calculate price change
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercentage = firstPrice > 0 ? ((priceChange / firstPrice) * 100) : 0;
  const isPositive = priceChange >= 0;

  // Safely prepare chart data with error handling
  const chartData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    return data.map(point => {
      const time = point?.time ? new Date(point.time).getTime() : Date.now();
      const price = typeof point?.price === 'number' && !isNaN(point.price) ? point.price : 0;
      return { x: time, y: price };
    }).filter(point => point.y > 0); // Filter out invalid prices
  }, [data]);

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Safely check dark mode
    const checkDarkMode = () => {
      if (typeof document !== 'undefined' && document.documentElement) {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      }
    };
    
    checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    if (typeof document !== 'undefined' && document.documentElement) {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
    
    return () => observer.disconnect();
  }, []);

  const chartOptions = {
    chart: {
      type: chartType as any,
      height: isMobile ? 280 : 400,
      toolbar: {
        show: true,
        tools: {
          download: !isMobile,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      zoom: {
        enabled: true,
        type: 'x' as any,
        autoScaleYaxis: true
      },
      background: 'transparent'
    },
    theme: {
      mode: (isDarkMode ? 'dark' : 'light') as 'dark' | 'light'
    },
    stroke: {
      curve: 'smooth' as any,
      width: 2
    },
    colors: [isPositive ? '#3b82f6' : '#ef4444'],
    fill: {
      type: chartType === 'area' ? 'gradient' : 'solid',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    xaxis: {
      type: 'datetime' as any,
      labels: {
        format: days === 1 ? 'HH:mm' : days <= 7 ? 'MMM dd' : 'MMM dd, yyyy',
        style: {
          colors: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `$${value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: value < 1 ? 6 : 2,
        })}`,
        style: {
          colors: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      }
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      x: {
        format: days === 1 ? 'MMM dd, HH:mm' : 'MMM dd, yyyy'
      },
      y: {
        formatter: (value: number) => `$${value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: value < 1 ? 6 : 2,
        })}`
      }
    },
    grid: {
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      strokeDashArray: 3
    },
    dataLabels: {
      enabled: false
    }
  };

  const series = [{
    name: `${coinName} Price`,
    data: chartData
  }];



  return (
    <div className="w-full h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={isPositive ? 'default' : 'destructive'} className="text-xs px-2 py-1">
            {isPositive ? '+' : ''}{priceChangePercentage.toFixed(2)}%
          </Badge>
        </div>
        
        <div className="flex gap-1 sm:gap-2">
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
            className="text-xs px-2 py-1 h-7 sm:h-8"
          >
            Line
          </Button>
          <Button
            variant={chartType === 'area' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('area')}
            className="text-xs px-2 py-1 h-7 sm:h-8"
          >
            Area
          </Button>
        </div>
      </div>
      
      <div className="w-full h-72 sm:h-96">
        {chartData.length > 0 ? (
          <Chart
            options={chartOptions}
            series={series}
            type={chartType}
            height={isMobile ? 280 : 400}
            width="100%"
            key={`chart-${coinName}-${days}`} // Force re-render on data change
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No chart data available</p>
          </div>
        )}
      </div>
    </div>
  );
}