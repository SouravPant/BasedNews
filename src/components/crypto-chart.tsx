import { useState } from 'react';
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



  // Calculate price change
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercentage = firstPrice > 0 ? ((priceChange / firstPrice) * 100) : 0;
  const isPositive = priceChange >= 0;

  // Prepare chart data
  const chartData = data.map(point => ({
    x: new Date(point.time).getTime(),
    y: point.price
  }));

  const isDarkMode = document.documentElement.classList.contains('dark');

  const chartOptions = {
    chart: {
      type: chartType as any,
      height: 400,
      toolbar: {
        show: true,
        tools: {
          download: true,
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant={isPositive ? 'default' : 'destructive'}>
            {isPositive ? '+' : ''}{priceChangePercentage.toFixed(2)}%
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
          >
            Line
          </Button>
          <Button
            variant={chartType === 'area' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('area')}
          >
            Area
          </Button>
        </div>
      </div>
      
      <div className="w-full h-96">
        <Chart
          options={chartOptions}
          series={series}
          type={chartType}
          height={400}
          width="100%"
        />
      </div>
    </div>
  );
}