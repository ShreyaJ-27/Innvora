import React, { useState } from 'react';

export const ResponsiveContainer: React.FC<{
  width?: string | number;
  height?: string | number;
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="w-full h-full relative">{children}</div>;
};

// ==================== DONUT / PIE CHART ====================

export interface PieChartProps {
  children: React.ReactNode;
}

export const PieChart: React.FC<PieChartProps> = ({ children }) => {
  return <div className="w-full h-full flex items-center justify-center">{children}</div>;
};

export interface PieProps {
  data: Array<{ name: string; value: number; color?: string }>;
  dataKey: string;
  cx?: string | number;
  cy?: string | number;
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  stroke?: string;
  children?: React.ReactNode;
}

export const Cell: React.FC<{ fill: string }> = () => null;

export const Pie: React.FC<PieProps> = ({
  data,
  dataKey,
  innerRadius = 60,
  outerRadius = 85,
  children,
}) => {
  const total = data.reduce((acc, d: any) => acc + (d[dataKey] || 0), 0) || 1;
  let accumulatedAngle = -90; // start at top

  // Extract cell fills if passed
  const cells = React.Children.toArray(children) as React.ReactElement[];

  const slices = data.map((d: any, idx) => {
    const val = d[dataKey] || 0;
    const angle = (val / total) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    const fill = cells[idx]?.props?.fill || d.color || '#3b82f6';

    // SVG arc calculation
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const cx = 100;
    const cy = 100;

    const x1 = cx + outerRadius * Math.cos(startRad);
    const y1 = cy + outerRadius * Math.sin(startRad);
    const x2 = cx + outerRadius * Math.cos(endRad);
    const y2 = cy + outerRadius * Math.sin(endRad);

    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    return {
      d: pathData,
      fill,
      name: d.name,
      value: val,
    };
  });

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 overflow-visible">
      {slices.map((slice, i) => (
        <path
          key={i}
          d={slice.d}
          fill={slice.fill}
          className="transition-all duration-300 hover:opacity-85 cursor-pointer"
        >
          <title>{`${slice.name}: ${slice.value}`}</title>
        </path>
      ))}
    </svg>
  );
};

// ==================== LINE CHART ====================

export interface LineChartProps {
  data: any[];
  margin?: { top?: number; right?: number; left?: number; bottom?: number };
  children: React.ReactNode;
}

export const LineChart: React.FC<LineChartProps> = ({ data, children }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Extract lines
  const childArray = React.Children.toArray(children) as React.ReactElement[];
  const lines = childArray.filter((c) => c.type === Line);
  const xAxis = childArray.find((c) => c.type === XAxis);
  const tooltip = childArray.find((c) => c.type === Tooltip);

  if (!data || data.length === 0) return null;

  // Find y min and max across all lines
  let maxY = 0;
  lines.forEach((line) => {
    const key = line.props.dataKey;
    data.forEach((d) => {
      if (d[key] && d[key] > maxY) maxY = d[key];
    });
  });
  maxY = maxY > 0 ? maxY * 1.15 : 100;

  const width = 500;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const xStep = chartW / Math.max(1, data.length - 1);

  const getCoordinates = (key: string) => {
    return data.map((d, i) => {
      const val = d[key] || 0;
      const x = paddingLeft + i * xStep;
      const y = paddingTop + chartH - (val / maxY) * chartH;
      return { x, y, val };
    });
  };

  const xKey = xAxis?.props?.dataKey || 'date';

  return (
    <div
      className="w-full h-full relative select-none"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingTop + chartH * (1 - ratio);
          const val = Math.round(maxY * ratio);
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#f1f5f9"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                fontSize="10"
                fill="#94a3b8"
                textAnchor="end"
              >
                {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              </text>
            </g>
          );
        })}

        {/* X Axis labels */}
        {data.map((d, i) => {
          const x = paddingLeft + i * xStep;
          return (
            <text
              key={i}
              x={x}
              y={height - 10}
              fontSize="10"
              fill="#94a3b8"
              textAnchor="middle"
            >
              {d[xKey]}
            </text>
          );
        })}

        {/* Lines */}
        {lines.map((line) => {
          const coords = getCoordinates(line.props.dataKey);
          const pathD = coords.reduce(
            (acc, curr, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`,
            ''
          );

          return (
            <g key={line.props.dataKey}>
              <path
                d={pathD}
                fill="none"
                stroke={line.props.stroke || '#2563eb'}
                strokeWidth={line.props.strokeWidth || 2}
                strokeDasharray={line.props.strokeDasharray}
              />
              {coords.map((c, idx) => (
                <circle
                  key={idx}
                  cx={c.x}
                  cy={c.y}
                  r={hoveredIndex === idx ? 5 : 3}
                  fill={line.props.stroke || '#2563eb'}
                  className="transition-all"
                />
              ))}
            </g>
          );
        })}

        {/* Vertical hover indicator */}
        {hoveredIndex !== null && (
          <line
            x1={paddingLeft + hoveredIndex * xStep}
            y1={paddingTop}
            x2={paddingLeft + hoveredIndex * xStep}
            y2={paddingTop + chartH}
            stroke="#cbd5e1"
            strokeDasharray="2 2"
          />
        )}

        {/* Transparent hover capture rects */}
        {data.map((_, i) => (
          <rect
            key={i}
            x={paddingLeft + i * xStep - xStep / 2}
            y={paddingTop}
            width={xStep}
            height={chartH}
            fill="transparent"
            className="cursor-crosshair"
            onMouseEnter={() => setHoveredIndex(i)}
          />
        ))}
      </svg>

      {/* Render tooltip if active */}
      {hoveredIndex !== null && tooltip && tooltip.props.content && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full z-30"
          style={{
            left: `${((paddingLeft + hoveredIndex * xStep) / width) * 100}%`,
            top: '25%',
          }}
        >
          {React.cloneElement(tooltip.props.content, {
            active: true,
            label: data[hoveredIndex][xKey],
            payload: lines.map((l) => ({
              name: l.props.name || l.props.dataKey,
              value: data[hoveredIndex][l.props.dataKey],
              color: l.props.stroke,
            })),
          })}
        </div>
      )}
    </div>
  );
};

export const Line: React.FC<{
  type?: string;
  dataKey: string;
  name?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  dot?: any;
  activeDot?: any;
}> = () => null;

export const XAxis: React.FC<{
  dataKey?: string;
  stroke?: string;
  fontSize?: number;
  tickLine?: boolean;
  axisLine?: any;
}> = () => null;

export const YAxis: React.FC<{
  stroke?: string;
  fontSize?: number;
  tickLine?: boolean;
  axisLine?: any;
  tickFormatter?: (val: any) => string;
}> = () => null;

export const CartesianGrid: React.FC<{
  strokeDasharray?: string;
  stroke?: string;
  vertical?: boolean;
}> = () => null;

export const Tooltip: React.FC<{
  content?: any;
  contentStyle?: any;
}> = () => null;

export const Legend: React.FC<{
  verticalAlign?: string;
  align?: string;
  wrapperStyle?: any;
}> = () => null;
