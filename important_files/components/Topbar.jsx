import React, { useState, useRef, useEffect } from 'react';
import { DISRUPTION_PRESETS } from '../data/mockException';

export default function Topbar({
  currentView = 'exceptions',
  activeCount = 4,
  onTriggerDisruption,
  onRerunAnalysis,
  isAnalyzing
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState('Today');
  const dropdownRef = useRef(null);

  const getTitle = () => {
    switch (currentView) {
      case 'hubs': return 'Hub Capacity Grid';
      case 'actions': return 'Automated Routing';
      case 'audit': return 'Audit & Compliance';
      case 'telemetry': return 'Live Telemetry Stream';
      default: return 'Delivery Exceptions';
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="topbar-container">
      <div className="topbar-title-wrap">
        <h1 className="page-heading">{getTitle()}</h1>
        <span className="page-sub mono">
          {activeCount} active exceptions · updated 19:35 IST
        </span>
      </div>

      <div className="topbar-actions">
        {/* Date Filter Pills */}
        <div className="period-pills">
          {['Today', '7d'].map((p) => (
            <button
              key={p}
              className={`period-pill ${timePeriod === p ? 'active' : ''}`}
              onClick={() => setTimePeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Cyan Run Collectors / AI Resolution Button (Exact style from Image 2) */}
        <button
          className={`btn-cyan-primary ${isAnalyzing ? 'loading' : ''}`}
          onClick={onRerunAnalysis}
          disabled={isAnalyzing}
          title="Run automated exception resolution pipeline"
        >
          {isAnalyzing ? (
            <>
              <span className="spinner-mini"></span>
              <span>Running collectors...</span>
            </>
          ) : (
            <span>Run collectors</span>
          )}
        </button>

        {/* Trigger Disruption Simulator */}
        <div className="dropdown-rel" ref={dropdownRef}>
          <button
            className="btn-trigger-disruption"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span>Trigger Disruption ▾</span>
          </button>

          {dropdownOpen && (
            <div className="disruption-dropdown-menu">
              <div className="dropdown-label">SIMULATE LIVE DISRUPTION</div>
              {DISRUPTION_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  className="dropdown-preset-row"
                  onClick={() => {
                    setDropdownOpen(false);
                    onTriggerDisruption(preset);
                  }}
                >
                  <div className="preset-name">{preset.hubName}</div>
                  <div className="preset-meta">
                    <span className="badge-red-mini">{preset.severity}</span>
                    <span className="preset-cat">{preset.category}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
