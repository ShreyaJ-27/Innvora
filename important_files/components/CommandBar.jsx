import React, { useState, useRef, useEffect } from 'react';
import { DISRUPTION_PRESETS } from '../data/mockException';

export default function CommandBar({ onTriggerDisruption, onRerunAnalysis, isAnalyzing, activeException }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPreset = (preset) => {
    setDropdownOpen(false);
    onTriggerDisruption(preset);
  };

  return (
    <div className="command-bar">
      <div className="command-bar-left">
        <span className="command-bar-label">OPERATIONS CONTROL:</span>
        <span className="command-bar-context mono">
          Target Hub: {activeException?.hubName || 'Mumbai Hub 02'} [{activeException?.hubId || 'HUB-BOM-02'}]
        </span>
      </div>

      <div className="command-bar-actions">
        {/* Re-run Analysis Button */}
        <button
          className={`btn-secondary ${isAnalyzing ? 'btn-analyzing' : ''}`}
          onClick={onRerunAnalysis}
          disabled={isAnalyzing}
          title="Re-query hub telemetry sensors and recalculate routing optimization"
        >
          {isAnalyzing ? (
            <>
              <span className="spinner-mini"></span>
              <span>Re-calculating Telemetry...</span>
            </>
          ) : (
            <>
              <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>Re-run Analysis</span>
            </>
          )}
        </button>

        {/* Trigger Disruption Simulator Dropdown */}
        <div className="dropdown-wrapper" ref={dropdownRef}>
          <button
            className="btn-danger-outline"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title="Inject simulated network failure into the active monitoring pipeline"
          >
            <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Trigger Disruption ▾</span>
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">SIMULATE LIVE DISRUPTION</div>
              {DISRUPTION_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  className="dropdown-item"
                  onClick={() => handleSelectPreset(preset)}
                >
                  <div className="item-title">{preset.hubName}</div>
                  <div className="item-meta">
                    <span className={`badge-sm badge-${preset.severity.toLowerCase()}`}>
                      {preset.severity}
                    </span>
                    <span className="item-cat">{preset.category}</span>
                  </div>
                </button>
              ))}
              <div className="dropdown-footer">
                Simulates real-time IoT alert stream
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
