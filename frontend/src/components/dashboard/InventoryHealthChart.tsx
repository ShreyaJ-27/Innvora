import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../common/Card';
import { InventoryHealthSummary } from '../../types/inventory';
import { STATUS_CONFIG } from '../../utils/colors';

export interface InventoryHealthChartProps {
  summary: InventoryHealthSummary | null;
  isLoading?: boolean;
}

export const InventoryHealthChart: React.FC<InventoryHealthChartProps> = ({
  summary,
  isLoading = false,
}) => {
  if (isLoading || !summary) {
    return (
      <Card
        header={<div className="font-semibold text-sm text-slate-800">Inventory Health Breakdown</div>}
      >
        <div className="h-64 flex items-center justify-center animate-pulse bg-slate-50 rounded-lg">
          <div className="w-32 h-32 rounded-full border-4 border-slate-200 border-t-blue-500" />
        </div>
      </Card>
    );
  }

  const chartData = [
    { name: 'Healthy', value: summary.healthyCount, color: STATUS_CONFIG.HEALTHY.chartColor },
    { name: 'Reorder Soon', value: summary.reorderSoonCount, color: STATUS_CONFIG.REORDER_SOON.chartColor },
    { name: 'Critical', value: summary.criticalCount, color: STATUS_CONFIG.CRITICAL.chartColor },
    { name: 'Overstocked', value: summary.overstockedCount, color: STATUS_CONFIG.OVERSTOCKED.chartColor },
  ].filter((item) => item.value > 0);

  const total = summary.totalSkus || 1;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = Math.round((data.value / total) * 100);
      return (
        <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg border border-slate-700">
          <p className="font-semibold">{data.name}</p>
          <p className="text-slate-300">
            {data.value} SKUs ({percent}%)
          </p>
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
            <h3 className="font-semibold text-sm text-slate-900">Inventory Health Breakdown</h3>
            <p className="text-xs text-slate-500">Real-time SKU stock level distribution</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            {Math.round((summary.healthyCount / total) * 100)}% In Health
          </span>
        </div>
      }
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2">
        {/* Donut Chart with Center Total */}
        <div className="relative w-full md:w-1/2 h-56 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                stroke="transparent"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered SKU counter */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-extrabold text-slate-900 leading-tight">
              {summary.totalSkus}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total SKUs
            </span>
          </div>
        </div>

        {/* Clean Semantic Legend */}
        <div className="w-full md:w-1/2 flex flex-col gap-2.5">
          {chartData.map((item) => {
            const pct = Math.round((item.value / total) * 100);
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 border border-slate-100 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900">{item.value} SKUs</span>
                  <span className="text-xs text-slate-400 w-9 text-right font-medium">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
