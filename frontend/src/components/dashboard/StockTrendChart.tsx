import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card } from '../common/Card';
import { InventoryHealthSummary } from '../../types/inventory';

export interface StockTrendChartProps {
  summary: InventoryHealthSummary | null;
  isLoading?: boolean;
}

export const StockTrendChart: React.FC<StockTrendChartProps> = ({
  summary,
  isLoading = false,
}) => {
  if (isLoading || !summary || !summary.stockTrend || summary.stockTrend.length === 0) {
    return (
      <Card header={<div className="text-sm font-semibold text-charcoal-800">Stock Velocity</div>}>
        <div className="h-56 flex items-center justify-center">
          <div className="w-full h-32 bg-sand-200 rounded-lg animate-pulse" />
        </div>
      </Card>
    );
  }

  // Warm tooltip replacing the dark one
  const WarmTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="bg-sand-100 border border-sand-400 rounded-lg px-3 py-2.5 text-xs"
        style={{ boxShadow: '0 4px 12px rgba(39,37,34,0.10)' }}
      >
        <p className="font-semibold text-charcoal-900 mb-1.5 pb-1 border-b border-sand-300">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-charcoal-600">{entry.name}</span>
            </div>
            <span className="font-semibold text-charcoal-900">{entry.value.toLocaleString()} units</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-sm font-semibold text-charcoal-900">Stock Velocity</h3>
            <p className="text-[11px] text-charcoal-400">7-day inbound/outbound movement</p>
          </div>
          <span className="text-[10px] text-charcoal-400 font-medium">Daily aggregates</span>
        </div>
      }
    >
      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={summary.stockTrend}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="2 4" stroke="#E2D9C8" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#A89580"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#D7CABB' }}
            />
            <YAxis
              stroke="#A89580"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<WarmTooltip />} />
            <Line
              type="monotone"
              dataKey="totalStock"
              name="Net Stock"
              stroke="#5A5349"
              strokeWidth={2}
              dot={{ r: 2.5, fill: '#5A5349', strokeWidth: 0 }}
              activeDot={{ r: 4, fill: '#272522' }}
            />
            <Line
              type="monotone"
              dataKey="inboundUnits"
              name="Inbound"
              stroke="#7A9E5D"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="outboundUnits"
              name="Outbound"
              stroke="#C6745A"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Simple legend */}
      <div className="flex items-center gap-5 pt-3 border-t border-sand-300 mt-2">
        {[
          { color: '#5A5349', label: 'Net Stock' },
          { color: '#7A9E5D', label: 'Inbound', dashed: true },
          { color: '#C6745A', label: 'Outbound', dashed: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full" style={{
              backgroundColor: item.color,
              borderBottom: item.dashed ? `1.5px dashed ${item.color}` : 'none',
            }} />
            <span className="text-[10px] text-charcoal-500">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
