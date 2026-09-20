import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../common/Card';
import { WarmChartTooltip } from '../common/Tooltip';
import { InventoryHealthSummary } from '../../types/inventory';
import { STATUS_CONFIG } from '../../utils/colors';

export interface InventoryHealthChartProps {
  summary: InventoryHealthSummary | null;
  isLoading?: boolean;
}

const WARM_COLORS = {
  HEALTHY: '#7A9E5D',
  REORDER_SOON: '#C6745A',
  CRITICAL: '#8E4530',
  OVERSTOCKED: '#A89580',
};

export const InventoryHealthChart: React.FC<InventoryHealthChartProps> = ({
  summary,
  isLoading = false,
}) => {
  if (isLoading || !summary) {
    return (
      <Card header={<div className="text-sm font-semibold text-charcoal-800">Inventory Health</div>}>
        <div className="h-56 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border-2 border-sand-400 border-t-charcoal-700 animate-spin" />
        </div>
      </Card>
    );
  }

  if (summary.totalSkus === 0) {
    return (
      <Card header={<div className="text-sm font-semibold text-charcoal-800">Inventory Health</div>}>
        <div className="h-56 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-10 h-10 rounded-xl bg-sand-200 border border-sand-400 flex items-center justify-center">
            <svg className="w-5 h-5 text-charcoal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-xs text-charcoal-500">No inventory data yet</p>
        </div>
      </Card>
    );
  }

  const chartData = [
    { name: 'Healthy', value: summary.healthyCount, color: WARM_COLORS.HEALTHY },
    { name: 'Reorder Soon', value: summary.reorderSoonCount, color: WARM_COLORS.REORDER_SOON },
    { name: 'Critical', value: summary.criticalCount, color: WARM_COLORS.CRITICAL },
    { name: 'Overstocked', value: summary.overstockedCount, color: WARM_COLORS.OVERSTOCKED },
  ].filter((d) => d.value > 0);

  const total = summary.totalSkus || 1;
  const healthPct = Math.round((summary.healthyCount / total) * 100);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    const pct = Math.round((d.value / total) * 100);
    return (
      <div className="bg-sand-100 border border-sand-400 rounded-lg px-3 py-2 text-xs" style={{ boxShadow: '0 4px 12px rgba(39,37,34,0.10)' }}>
        <p className="font-semibold text-charcoal-900">{d.name}</p>
        <p className="text-charcoal-500">{d.value} SKUs — {pct}%</p>
      </div>
    );
  };

  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-sm font-semibold text-charcoal-900">Inventory Health</h3>
            <p className="text-[11px] text-charcoal-400">SKU stock level distribution</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-olive-50 text-olive-700 border-olive-200 uppercase tracking-wider">
            {healthPct}% Healthy
          </span>
        </div>
      }
    >
      <div className="flex flex-col md:flex-row items-center gap-6 py-2">
        {/* Donut */}
        <div className="relative w-full md:w-1/2 h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="transparent"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              {/* @ts-ignore */}
              <WarmChartTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-extrabold text-charcoal-900 leading-none">{summary.totalSkus}</span>
            <span className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-widest mt-0.5">SKUs</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full md:w-1/2 space-y-2">
          {chartData.map((item) => {
            const pct = Math.round((item.value / total) * 100);
            return (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-sand-300 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-charcoal-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-charcoal-900">{item.value}</span>
                  <span className="text-[11px] text-charcoal-400 w-8 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
