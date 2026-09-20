import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Sparkles,
  Activity,
  Search,
  Settings,
  HelpCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Warehouse,
} from 'lucide-react';
import { IconButton } from '../common/IconButton';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();
  
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inventory', label: 'Inventory', icon: Boxes },
    { to: '/reorders', label: 'Replenishment', icon: Sparkles },
    { to: '/activity', label: 'Activity', icon: Activity },
    { to: '/search', label: 'Search', icon: Search },
  ];

  const bottomItems = [
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/help', label: 'Help & Docs', icon: HelpCircle },
  ];

  const activeClass = 'bg-sand-200 text-charcoal-900 font-semibold shadow-[inset_3px_0_0_#5A5349]';
  const inactiveClass = 'text-charcoal-500 hover:text-charcoal-900 hover:bg-sand-100 hover:translate-x-0.5';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal-900/30 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col
          border-r border-sand-400 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-16' : 'lg:w-56'} w-60`}
        style={{
          backgroundColor: 'rgba(248,244,236,0.92)',
          backdropFilter: 'blur(16px)',
          boxShadow: isOpen ? '4px 0 16px rgba(39,37,34,0.08)' : 'none',
        }}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-sand-400 shrink-0">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 overflow-hidden group"
          >
            {/* Logo mark */}
            <div className="w-8 h-8 rounded-md bg-charcoal-900 flex items-center justify-center shrink-0">
              <Warehouse className="w-4 h-4 text-sand-200" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-sm tracking-tight text-charcoal-900 leading-tight">
                  Innvora
                </span>
                <span className="text-[9px] font-semibold tracking-widest text-charcoal-400 uppercase">
                  Inventory Ops
                </span>
              </div>
            )}
          </button>

          {/* Close on mobile */}
          <div className="lg:hidden">
            <IconButton aria-label="Close sidebar" onClick={onClose} size="sm">
              <X className="w-4 h-4" />
            </IconButton>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {!isCollapsed && (
            <p className="px-2 pb-2 text-[9px] font-bold text-charcoal-400 uppercase tracking-widest">
              Operations
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all duration-200
                  ${isActive ? activeClass : inactiveClass}
                  ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Utility Items */}
        <div className="p-2 border-t border-sand-400 space-y-0.5">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) =>
                  `w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all duration-200
                  ${isActive ? activeClass : inactiveClass}
                  ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}

          {/* Collapse toggle for desktop */}
          <div className="hidden lg:flex pt-1 justify-end">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-sand-300 text-xs flex items-center gap-1 w-full justify-center transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-[10px]">Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
