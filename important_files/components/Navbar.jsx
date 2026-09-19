import React from 'react';
import { Bell, Settings, Layers, Sparkles, ChevronDown } from 'lucide-react';

export default function Navbar({
  activeTab = 'home',
  onTabChange,
  unapprovedCount = 0,
  onOpenNotifications,
}) {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard', badge: unapprovedCount > 0 ? unapprovedCount : null },
    { id: 'analytics', label: 'Analytics' },
    { id: 'management', label: 'Management' },
  ];

  return (
    <header className="ref-navbar">
      {/* LEFT: Logo & Product Name */}
      <div className="ref-nav-left">
        <div className="ref-logo-icon">
          <Layers className="w-4 h-4 text-[#171717]" />
        </div>
        <div className="ref-brand-text">
          <span className="ref-brand-title">AmazonFlow</span>
          <span className="ref-brand-sub">Enterprise Ops</span>
        </div>
      </div>

      {/* CENTER: Navigation Tabs */}
      <nav className="ref-nav-center" aria-label="Main Navigation">
        <div className="ref-nav-pills">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`ref-pill-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ref-pill-badge">{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* RIGHT: Notifications, Settings, User Avatar */}
      <div className="ref-nav-right">
        <button
          type="button"
          className="ref-icon-btn relative"
          onClick={onOpenNotifications}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unapprovedCount > 0 && <span className="ref-notif-dot" />}
        </button>

        <button
          type="button"
          className="ref-icon-btn"
          aria-label="Settings"
          title="System Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="ref-avatar-wrap" title="Lead Operations Director">
          <div className="ref-avatar-img">
            <span>SD</span>
          </div>
          <span className="ref-avatar-status" />
        </div>
      </div>
    </header>
  );
}
