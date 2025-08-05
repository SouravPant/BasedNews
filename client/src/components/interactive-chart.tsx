import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartDataPoint {
  time: string;
  price: number;
}

interface InteractiveChartProps {
  data: ChartDataPoint[];
  coinName: string;
}

export function InteractiveChart({ data, coinName }: InteractiveChartProps) {
  const [timeframe, setTimeframe] = useState("7d");

  const timeframes = [
    { label: "1D", value: "1d" },
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "90D", value: "90d" },
    { label: "1Y", value: "1y" },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeframe === "1d") {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const chartData = data.map(point => ({
    ...point,
    formattedTime: formatDate(point.time),
    formattedPrice: formatPrice(point.price)
  }));

  // Calculate price change
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercentage = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="space-y-4">
      {/* Timeframe Selection */}
      <div className="flex space-x-2 justify-center">
        {timeframes.map((tf) => (
          <Button
            key={tf.value}
            variant={timeframe === tf.value ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe(tf.value)}
            data-testid={`button-timeframe-${tf.value}`}
          >
            {tf.label}
          </Button>
        ))}
      </div>

      {/* Price Change Info */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {timeframe.toUpperCase()} Price Change
        </p>
        <p className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{formatPrice(priceChange)} ({isPositive ? '+' : ''}{priceChangePercentage.toFixed(2)}%)
        </p>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis 
              dataKey="formattedTime" 
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(value < 1 ? 4 : 0)}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                      <p className="font-semibold text-blue-600">
                        {formatPrice(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: isPositive ? "#10b981" : "#ef4444" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Historical price data for {coinName} over the last {timeframe}
      </div>
    </div>
  );
}