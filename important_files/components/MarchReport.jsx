import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Calendar,
  Download,
  ArrowUpRight,
  TrendingUp,
  Package,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function MarchReport({ onSelectMetric }) {
  const [movementType, setMovementType] = useState('All Movements');
  const [warehouse, setWarehouse] = useState('All Hubs');
  const [category, setCategory] = useState('All Categories');

  const kpiRows = [
    {
      metric: 'Total Inventory Value',
      value: '$1,240,000',
      change: '+5.4%',
      status: 'Healthy',
      statusType: 'healthy',
    },
    {
      metric: 'Units in Stock',
      value: '48,920',
      change: '+2.1%',
      status: 'Stable',
      statusType: 'stable',
    },
    {
      metric: 'Incoming Stock',
      value: '2,480',
      change: '+4.7%',
      status: 'High',
      statusType: 'high',
    },
    {
      metric: 'Outbound Shipments',
      value: '18,450',
      change: '+8.3%',
      status: 'Optimal',
      statusType: 'healthy',
    },
    {
      metric: 'Priority Deliveries',
      value: '1,400',
      change: '+12.0%',
      status: 'Protected',
      statusType: 'healthy',
    },
  ];

  return (
    <section className="ref-report-section">
      {/* Report Section Header with Filters */}
      <div className="ref-report-header">
        <div className="ref-report-title-wrap">
          <h2 className="ref-report-title">March Report</h2>
          <span className="ref-report-sub">Overview KPI</span>
        </div>

        {/* Filter Controls on Right */}
        <div className="ref-report-filters">
          <div className="ref-filter-pill-group">
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              className="ref-filter-select"
              aria-label="Filter by movement type"
            >
              <option value="All Movements">Movement Type: All</option>
              <option value="Inbound">Inbound Transfer</option>
              <option value="Outbound">Outbound Line-Haul</option>
              <option value="Cross-Dock">Cross-Dock Reassignment</option>
            </select>

            <select
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="ref-filter-select"
              aria-label="Filter by warehouse"
            >
              <option value="All Hubs">Warehouse: All Hubs</option>
              <option value="Mumbai Hub 02">Mumbai Hub 02</option>
              <option value="Delhi Hub 01">Delhi Hub 01</option>
              <option value="Thane Hub 01">Thane Hub 01</option>
              <option value="Bengaluru Hub 03">Bengaluru Hub 03</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="ref-filter-select"
              aria-label="Filter by category"
            >
              <option value="All Categories">Category: All</option>
              <option value="Priority Prime">Priority Prime</option>
              <option value="Standard Parcels">Standard Parcels</option>
              <option value="Heavy Freight">Heavy Freight</option>
            </select>
          </div>

          {/* Small Circular Icon Buttons */}
          <div className="ref-circular-actions">
            <button
              type="button"
              className="ref-circle-btn"
              title="Filter Presets"
              aria-label="Filter Presets"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="ref-circle-btn"
              title="Select Date Range"
              aria-label="Select Date Range"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="ref-circle-btn"
              title="Export Report CSV"
              aria-label="Export Report CSV"
              onClick={() => alert('Exporting March KPI Report to CSV...')}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main Cards Grid */}
      <div className="ref-three-cards-grid">
        {/* CARD 1: Overview KPI Table Card */}
        <div className="ref-card ref-kpi-table-card">
          <div className="ref-card-header">
            <h3 className="ref-card-title">Overview KPI</h3>
            <span className="ref-card-badge">Real-Time Ingestion</span>
          </div>

          <div className="ref-table-responsive">
            <table className="ref-kpi-table">
              <thead>
                <tr>
                  <th className="text-left">Metric</th>
                  <th className="text-right">Current Value</th>
                  <th className="text-right">Change</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {kpiRows.map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onSelectMetric && onSelectMetric(row.metric)}
                    className="ref-table-row"
                  >
                    <td className="font-medium text-white">{row.metric}</td>
                    <td className="text-right mono font-bold text-white">{row.value}</td>
                    <td className="text-right mono font-semibold text-lime">
                      <span className="inline-flex items-center gap-0.5 justify-end">
                        <ArrowUpRight className="w-3 h-3" />
                        {row.change}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`ref-status-pill ${row.statusType}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CARD 2: Monthly Sales Goal Card */}
        <div className="ref-card ref-sales-goal-card">
          <div className="ref-card-header">
            <h3 className="ref-card-title">Monthly Sales Goal</h3>
            <span className="ref-card-tag mono">Target: $2.0M</span>
          </div>

          <div className="ref-sales-body">
            {/* Circular / Radial Visual Progress Indicator */}
            <div className="ref-radial-wrap">
              <svg viewBox="0 0 160 160" className="ref-radial-svg">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="12"
                />
                {/* Active Lime Progress Arc (63% of 2 * PI * 62 = 389.5 -> 245.4) */}
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  fill="none"
                  stroke="#D8FF3E"
                  strokeWidth="12"
                  strokeDasharray="389.5"
                  strokeDashoffset="144"
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                  className="ref-radial-fill"
                />
              </svg>

              <div className="ref-radial-center">
                <span className="ref-radial-percent mono">63%</span>
                <span className="ref-radial-sub">Achieved</span>
              </div>
            </div>

            {/* Horizontal Lime Segmented Bar Visualization */}
            <div className="ref-segmented-goal-bar">
              <div className="ref-segmented-track">
                <div className="ref-segmented-fill" style={{ width: '63%' }} />
                {/* Milestone Tick Marks */}
                <div className="ref-milestone m-1" title="25% Milestone" />
                <div className="ref-milestone m-2" title="50% Milestone" />
                <div className="ref-milestone m-3" title="75% Milestone" />
              </div>
              <div className="ref-goal-labels mono">
                <span>$0</span>
                <span className="text-lime font-bold">$1.26M Current</span>
                <span>$2.0M Goal</span>
              </div>
            </div>

            {/* Supporting Context Text */}
            <div className="ref-goal-support">
              <p className="ref-goal-text">
                "Keep pushing until you reach the monthly target."
              </p>
              <span className="ref-goal-meta text-gray">
                12 days remaining in March billing cycle
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: Inventory Distribution Overview Card */}
        <div className="ref-card ref-distribution-card">
          <div className="ref-card-header">
            <h3 className="ref-card-title">Inventory Distribution Overview</h3>
            <span className="ref-card-tag mono">Network Wide</span>
          </div>

          <div className="ref-dist-body">
            {/* Donut Chart with Center Units */}
            <div className="ref-donut-wrap">
              <svg viewBox="0 0 160 160" className="ref-donut-svg">
                {/* Circumference = 2 * PI * 58 = 364.4 */}
                {/* Segment 4: In Transit 7% -> length 25.5 */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  fill="none"
                  stroke="#27272A"
                  strokeWidth="14"
                  strokeDasharray="364.4"
                  strokeDashoffset="0"
                  transform="rotate(-90 80 80)"
                />
                {/* Segment 3: Retail Store 15% -> length 54.6 */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  fill="none"
                  stroke="#3F3F46"
                  strokeWidth="14"
                  strokeDasharray="364.4"
                  strokeDashoffset="25.5"
                  transform="rotate(-90 80 80)"
                />
                {/* Segment 2: Warehouse B 24% -> length 87.4 */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  fill="none"
                  stroke="#71717A"
                  strokeWidth="14"
                  strokeDasharray="364.4"
                  strokeDashoffset="80.1"
                  transform="rotate(-90 80 80)"
                />
                {/* Segment 1: Warehouse A 54% (Main stroke in Lime #D8FF3E) -> length 196.7 */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  fill="none"
                  stroke="#D8FF3E"
                  strokeWidth="14"
                  strokeDasharray="364.4"
                  strokeDashoffset="167.5"
                  transform="rotate(-90 80 80)"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Metrics: 48,920 Units in Stock */}
              <div className="ref-donut-center">
                <span className="ref-donut-val mono">48,920</span>
                <span className="ref-donut-sub">Units in Stock</span>
              </div>
            </div>

            {/* Categories Breakdown Legend with percentages */}
            <div className="ref-dist-legend">
              <div className="ref-dist-item">
                <div className="flex items-center gap-2">
                  <span className="ref-dist-dot" style={{ backgroundColor: '#D8FF3E' }} />
                  <span className="text-white font-medium">Warehouse A</span>
                </div>
                <span className="mono font-bold text-lime">54%</span>
              </div>

              <div className="ref-dist-item">
                <div className="flex items-center gap-2">
                  <span className="ref-dist-dot" style={{ backgroundColor: '#71717A' }} />
                  <span className="text-gray font-medium">Warehouse B</span>
                </div>
                <span className="mono font-bold text-white">24%</span>
              </div>

              <div className="ref-dist-item">
                <div className="flex items-center gap-2">
                  <span className="ref-dist-dot" style={{ backgroundColor: '#3F3F46' }} />
                  <span className="text-gray font-medium">Retail Store</span>
                </div>
                <span className="mono font-bold text-white">15%</span>
              </div>

              <div className="ref-dist-item">
                <div className="flex items-center gap-2">
                  <span className="ref-dist-dot" style={{ backgroundColor: '#27272A' }} />
                  <span className="text-gray font-medium">In Transit</span>
                </div>
                <span className="mono font-bold text-white">7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
