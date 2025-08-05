import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface ChartDataPoint {
  time: string;
  price: number;
}

interface CryptoChartProps {
  data: ChartDataPoint[];
  coinName: string;
  coinSymbol: string;
  days: number;
}

export function CryptoChart({ data, coinName, coinSymbol, days }: CryptoChartProps) {
  // Detect theme for proper axis colors
  const isDarkTheme = document.documentElement.classList.contains('dark') || 
                     document.documentElement.classList.contains('base');
  const axisColor = isDarkTheme ? '#ffffff' : '#374151';
  const formatXAxisTick = (tickItem: string) => {
    const date = new Date(tickItem);
    if (days === 1) {
      return format(date, 'HH:mm');
    } else if (days <= 7) {
      return format(date, 'MMM dd');
    } else {
      return format(date, 'MMM dd');
    }
  };

  const formatTooltipLabel = (label: string) => {
    const date = new Date(label);
    if (days === 1) {
      return format(date, 'MMM dd, HH:mm');
    } else {
      return format(date, 'MMM dd, yyyy');
    }
  };

  const formatPrice = (value: number) => {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    })}`;
  };

  // Calculate price change color
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const lineColor = priceChange >= 0 ? '#3b82f6' : '#ef4444'; // Use blue instead of green for brand consistency

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground mb-1">
          {coinName} ({coinSymbol.toUpperCase()})
        </h3>
        <p className="text-sm text-muted-foreground">
          {days === 1 ? '24 Hours' : `${days} Days`} Price Chart
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            tickFormatter={formatXAxisTick}
            stroke={axisColor}
            fontSize={12}
            tick={{ fill: axisColor, fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            stroke={axisColor}
            fontSize={12}
            width={80}
            tick={{ fill: axisColor, fontSize: 12 }}
          />
          <Tooltip 
            labelFormatter={formatTooltipLabel}
            formatter={(value: number) => [formatPrice(value), 'Price']}
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: lineColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}