import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '../common/Card';
import { InventoryHealthSummary } from '../../types/inventory';
import { formatNumber } from '../../utils/formatters';

export interface StockTrendChartProps {
  summary: InventoryHealthSummary | null;
  isLoading?: boolean;
}

export const StockTrendChart: React.FC<StockTrendChartProps> = ({
  summary,
  isLoading = false,
}) => {
  if (isLoading || !summary || !summary.stockTrend) {
    return (
      <Card
        header={<div className="font-semibold text-sm text-slate-800">Inventory Velocity & Movement</div>}
      >
        <div className="h-64 flex items-center justify-center animate-pulse bg-slate-50 rounded-lg">
          <div className="w-full h-40 bg-slate-100 rounded" />
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl border border-slate-700 space-y-1">
          <p className="font-semibold text-slate-300 border-b border-slate-700 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-white">{formatNumber(entry.value)} units</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="font-semibold text-sm text-slate-900">Inventory Velocity & Inbound/Outbound</h3>
            <p className="text-xs text-slate-500">7-day stock trajectory across fulfillment points</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Daily Aggregates</span>
        </div>
      }
    >
      <div className="h-64 w-full py-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={summary.stockTrend}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
            />
            <Line
              type="monotone"
              dataKey="totalStock"
              name="Net Stock Units"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#2563eb' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="inboundUnits"
              name="Inbound Restock"
              stroke="#10b981"
              strokeWidth={1.8}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="outboundUnits"
              name="Outbound Fulfillments"
              stroke="#f43f5e"
              strokeWidth={1.8}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
