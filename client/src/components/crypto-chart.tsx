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
  const lineColor = priceChange >= 0 ? '#10b981' : '#ef4444';

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          {coinName} ({coinSymbol.toUpperCase()})
        </h3>
        <p className="text-sm text-slate-400">
          {days === 1 ? '24 Hours' : `${days} Days`} Price Chart
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            tickFormatter={formatXAxisTick}
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            stroke="#9ca3af"
            fontSize={12}
          />
          <Tooltip 
            labelFormatter={formatTooltipLabel}
            formatter={(value: number) => [formatPrice(value), 'Price']}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6'
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