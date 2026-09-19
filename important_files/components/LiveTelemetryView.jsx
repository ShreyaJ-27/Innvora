import React, { useState, useEffect } from 'react';

const SENSOR_STREAM = [
  { id: 'SEN-BOM-04', hub: 'Mumbai Hub 02', type: 'Optical Sorter Bay #4', metric: '1,420 pkgs/hr', status: 'WARNING', value: -22, unit: '% vs nominal', time: 'Just now' },
  { id: 'SEN-BOM-01', hub: 'Mumbai Hub 02', type: 'Feeder Dock Vehicle Sensor', metric: '41 Vehicles Waiting', status: 'CRITICAL', value: +180, unit: '% dock queue', time: '1s ago' },
  { id: 'SEN-DEL-02', hub: 'Delhi Hub 01', type: 'Scanner Ejection Error Rail', metric: '18.4% Error Rate', status: 'CRITICAL', value: +17.9, unit: '% threshold breach', time: '3s ago' },
  { id: 'SEN-DEL-08', hub: 'Delhi Hub 01', type: 'Motor Thermal Coupling', metric: '78.2°C Thermal', status: 'WARNING', value: +14.2, unit: '°C variance', time: '5s ago' },
  { id: 'SEN-BLR-09', hub: 'Bengaluru South 03', type: 'EV Cluster Substation Transformer', metric: '64% Battery Readiness', status: 'HIGH', value: -28, unit: '% operational', time: '8s ago' },
  { id: 'SEN-HYD-03', hub: 'Hyderabad Central', type: 'NH44 Corridor Speed Sensor', metric: '14.1 km/h Avg Velocity', status: 'MEDIUM', value: -74, unit: '% transit speed', time: '12s ago' },
  { id: 'SEN-THA-01', hub: 'Thane Hub 01', type: 'Inbound Ingestion Headroom', metric: '42% Load Factor', status: 'OPTIMAL', value: 58, unit: '% headroom free', time: '15s ago' },
  { id: 'SEN-CCU-02', hub: 'Kolkata Hub 01', type: 'Conveyor Drive Calibration', metric: '2.21 m/s Line Speed', status: 'OPTIMAL', value: 0.1, unit: '% jitter nominal', time: '20s ago' }
];

export default function LiveTelemetryView() {
  const [pulseTime, setPulseTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseTime(Date.now());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="view-panel">
      <div className="view-header">
        <div className="view-header-title">
          <h2>Live IoT Telemetry & Sensor Diagnostics Stream</h2>
          <p>Real-time edge sensor telemetry ingested from sorting belts, optical scanners, and docks</p>
        </div>

        <div className="telemetry-live-badge">
          <span className="pulse-indicator"></span>
          <span className="mono">STREAM ACTIVE // 2.4k pkt/s</span>
        </div>
      </div>

      <div className="telemetry-gauge-grid">
        <div className="telemetry-gauge-card">
          <div className="gauge-title">INBOUND DOCK QUEUE PRESSURE</div>
          <div className="gauge-val mono text-red">+41 Vans</div>
          <div className="gauge-sub">Mumbai Hub 02 Docking Staging Area</div>
        </div>
        <div className="telemetry-gauge-card">
          <div className="gauge-title">OPTICAL SCANNER ERROR RATE</div>
          <div className="gauge-val mono text-amber">18.4%</div>
          <div className="gauge-sub">Delhi Hub 01 Rail Bay #2</div>
        </div>
        <div className="telemetry-gauge-card">
          <div className="gauge-title">TRANSIT CORRIDOR VELOCITY</div>
          <div className="gauge-val mono text-amber">14 km/h</div>
          <div className="gauge-sub">Hyderabad NH44 Arterial Monsoon Sensor</div>
        </div>
        <div className="telemetry-gauge-card">
          <div className="gauge-title">REGIONAL NETWORK HEALTH</div>
          <div className="gauge-val mono text-green">94.8%</div>
          <div className="gauge-sub">Aggregated India Fulfillment Grid</div>
        </div>
      </div>

      <div className="telemetry-stream-container">
        <div className="stream-header">
          <span>EDGE TELEMETRY SENSOR PACKET FEED</span>
          <span className="mono text-muted">Filter: ALL SENSORS (Active Pulse)</span>
        </div>

        <div className="sensor-list">
          {SENSOR_STREAM.map(sensor => (
            <div key={sensor.id} className="sensor-row">
              <div className="sensor-left">
                <span className={`sensor-pulse-dot dot-${sensor.status.toLowerCase()}`}></span>
                <span className="sensor-id mono">{sensor.id}</span>
                <span className="sensor-hub-tag mono">{sensor.hub}</span>
                <span className="sensor-type">{sensor.type}</span>
              </div>

              <div className="sensor-center">
                <span className="sensor-metric mono">{sensor.metric}</span>
                <span className="sensor-variance mono text-muted">({sensor.value > 0 ? `+${sensor.value}` : sensor.value} {sensor.unit})</span>
              </div>

              <div className="sensor-right">
                <span className={`badge-severity badge-${sensor.status.toLowerCase()}`}>
                  {sensor.status}
                </span>
                <span className="sensor-time mono">{sensor.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
