import React, { useState } from 'react';
import './App.css';

// Redesigned Reference Components
import Navbar from './components/Navbar';
import HeroOverview from './components/HeroOverview';
import MarchReport from './components/MarchReport';

// Preserved Operational & AWS Command Center Components
import OpsBannerAndStats from './components/OpsBannerAndStats';
import ExceptionList from './components/ExceptionList';
import ExceptionCard from './components/ExceptionCard';
import AIRecommendationCard from './components/AIRecommendationCard';
import ReviewModal from './components/ReviewModal';
import ActivityLog from './components/ActivityLog';

// Secondary Operational Views
import HubCapacityView from './components/HubCapacityView';
import AutomatedRoutingView from './components/AutomatedRoutingView';
import AuditComplianceView from './components/AuditComplianceView';
import LiveTelemetryView from './components/LiveTelemetryView';

// Initial Mock Data
import { INITIAL_EXCEPTIONS, INITIAL_ACTIVITY_LOG, DISRUPTION_PRESETS } from './data/mockException';
import { AlertTriangle, ArrowRight, CheckCircle2, RefreshCw, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'dashboard' | 'analytics' | 'management'
  const [selectedHubFilter, setSelectedHubFilter] = useState('ALL');
  const [exceptions, setExceptions] = useState(INITIAL_EXCEPTIONS);
  const [selectedExceptionId, setSelectedExceptionId] = useState('EXP-8821'); // Default: Mumbai Hub 02
  const [approvedMap, setApprovedMap] = useState({});
  const [showReview, setShowReview] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activityLog, setActivityLog] = useState(INITIAL_ACTIVITY_LOG);
  const [showDisruptionMenu, setShowDisruptionMenu] = useState(false);

  const displayedExceptions = selectedHubFilter === 'ALL'
    ? exceptions
    : exceptions.filter(e => e.hubId === selectedHubFilter || e.hubName.toLowerCase().includes(selectedHubFilter.toLowerCase()));

  const activeException = exceptions.find(e => e.id === selectedExceptionId) || exceptions[0];
  const isCurrentApproved = !!approvedMap[activeException?.id];
  const unapprovedCount = exceptions.filter(e => !approvedMap[e.id]).length;

  const handleSelectException = (id) => {
    setSelectedExceptionId(id);
  };

  const handleOpenReview = () => {
    setShowReview(true);
  };

  const handleCloseReview = () => {
    setShowReview(false);
  };

  const handleApprove = () => {
    if (!activeException) return;

    setApprovedMap(prev => ({
      ...prev,
      [activeException.id]: true
    }));

    const newActivity = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      hubName: activeException.hubName,
      action: `Approved: ${activeException.recommendation?.actionTitle || 'Reassignment executed'}`,
      operator: 'Snigdha (West Lead)',
      impact: activeException.recommendation?.impactMitigation?.slaBreachPrevented || 'SLA Preserved',
      status: 'EXECUTED'
    };

    setActivityLog(prev => [newActivity, ...prev]);
    setShowReview(false);
  };

  const handleReject = () => {
    setShowReview(false);
  };

  const handleTriggerDisruption = (preset) => {
    const newException = {
      ...preset,
      id: `EXP-${Math.floor(8850 + Math.random() * 100)}`,
      detectedAt: 'Just now'
    };

    setExceptions(prev => [newException, ...prev]);
    setSelectedExceptionId(newException.id);
    setSelectedHubFilter('ALL');
    setActiveTab('dashboard');
    setShowDisruptionMenu(false);
  };

  const handleRerunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="ref-outer-canvas">
      {/* Centered Main Dashboard Container with Rounded Corners & Dark Theme */}
      <div className="ref-dashboard-app">
        {/* Top Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          unapprovedCount={unapprovedCount}
          onOpenNotifications={() => setActiveTab('dashboard')}
        />

        {/* TAB 1: HOME (Matching Reference UI: Hero + March Report) */}
        {activeTab === 'home' && (
          <div className="ref-content-flow animate-fade-in">
            {/* 1. Hero / Overview Section */}
            <HeroOverview
              activeException={activeException}
              onViewDetails={handleOpenReview}
            />

            {/* 2. March Report Section (KPI Table + Monthly Sales Goal + Inventory Distribution) */}
            <MarchReport
              onSelectMetric={(_metric) => setActiveTab('dashboard')}
            />

            {/* 3. Quick Operational Disruption & Exceptions Hub Bar */}
            <div className="ref-hub-quick-strip">
              <div className="ref-strip-left">
                <div className="ref-strip-icon-alert">
                  <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                </div>
                <div>
                  <span className="ref-strip-title">
                    Active Critical Incident: {activeException.hubName} ({activeException.category})
                  </span>
                  <p className="ref-strip-sub">
                    {activeException.affectedOrders} orders at risk · AI Recommended Action ready for Human-In-The-Loop review.
                  </p>
                </div>
              </div>

              <div className="ref-strip-actions">
                <div className="relative">
                  <button
                    type="button"
                    className="ref-btn-disruption"
                    onClick={() => setShowDisruptionMenu(!showDisruptionMenu)}
                  >
                    <span>Simulate Disruption ▾</span>
                  </button>

                  {showDisruptionMenu && (
                    <div className="ref-disruption-popup">
                      <div className="ref-popup-header">SELECT PRESET DISRUPTION</div>
                      {DISRUPTION_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="ref-popup-item"
                          onClick={() => handleTriggerDisruption(preset)}
                        >
                          <div className="font-semibold text-white text-xs">{preset.hubName}</div>
                          <div className="text-[11px] text-gray">{preset.category} ({preset.severity})</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="ref-btn-resolve"
                  onClick={handleOpenReview}
                >
                  <span>Review & Resolve</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DASHBOARD (Operational Command Center with Exception Matrix & Side Rail) */}
        {activeTab === 'dashboard' && (
          <div className="ref-content-flow animate-fade-in">
            {/* Top Stats Banner */}
            <OpsBannerAndStats
              activeException={activeException}
              exceptions={exceptions}
              unapprovedCount={unapprovedCount}
              onOpenReview={handleOpenReview}
              onSelectException={handleSelectException}
            />

            {/* Main Split Grid (65% Table / 35% Side Rail) */}
            <div className="main-split-grid">
              <div className="grid-left-col">
                <ExceptionList
                  exceptions={displayedExceptions}
                  selectedId={selectedExceptionId}
                  onSelectException={handleSelectException}
                  approvedMap={approvedMap}
                  onOpenReview={handleOpenReview}
                />
              </div>

              <div className="grid-right-col">
                <AIRecommendationCard
                  exception={activeException}
                  recommendation={activeException?.recommendation}
                  isApproved={isCurrentApproved}
                  onOpenReview={handleOpenReview}
                />

                <ExceptionCard
                  exception={activeException}
                  isApproved={isCurrentApproved}
                />
              </div>
            </div>

            {/* Real-Time Resolution Audit Ledger */}
            <ActivityLog activities={activityLog} />
          </div>
        )}

        {/* TAB 3: ANALYTICS (Hub Capacity Grid + Live IoT Telemetry) */}
        {activeTab === 'analytics' && (
          <div className="ref-content-flow animate-fade-in space-y-6">
            <HubCapacityView
              onSelectHubForException={(hubName) => {
                const found = exceptions.find(e => e.hubName.toLowerCase().includes(hubName.toLowerCase()));
                if (found) setSelectedExceptionId(found.id);
                setActiveTab('dashboard');
              }}
            />
            <LiveTelemetryView />
          </div>
        )}

        {/* TAB 4: MANAGEMENT (Automated Routing Rules + Immutable Audit Compliance) */}
        {activeTab === 'management' && (
          <div className="ref-content-flow animate-fade-in space-y-6">
            <AutomatedRoutingView />
            <AuditComplianceView />
          </div>
        )}

        {/* Global Footer */}
        <footer className="ref-dashboard-footer">
          <div className="flex items-center gap-2">
            <span className="ref-status-live-dot" />
            <span className="mono text-xs text-gray">Edge Telemetry: Online (Latency 14ms)</span>
          </div>
          <div className="mono text-xs text-gray">
            AWS CloudTrail · DynamoDB Active · OpenSearch Ingestion OK
          </div>
        </footer>
      </div>

      {/* HITL Review Modal with Keyboard Shortcuts ([A] Approve, [R] Reject, [Esc] Close) */}
      <ReviewModal
        isOpen={showReview}
        exception={activeException}
        onClose={handleCloseReview}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
