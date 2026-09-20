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
  Warehouse,
} from 'lucide-react';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',        icon: LayoutDashboard, shortcut: 'D' },
  { to: '/inventory',  label: 'Inventory',         icon: Boxes,           shortcut: 'I' },
  { to: '/reorders',   label: 'Replenishment',     icon: Sparkles,        shortcut: 'R' },
  { to: '/activity',   label: 'Activity',          icon: Activity,        shortcut: 'A' },
  { to: '/search',     label: 'Search',            icon: Search,          shortcut: 'S' },
];

const bottomItems = [
  { to: '/settings', label: 'Settings',   icon: Settings },
  { to: '/help',     label: 'Help & Docs', icon: HelpCircle },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal-900/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 flex flex-col
          border-r border-sand-400/70
          transition-all duration-280 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-14' : 'lg:w-52'} w-56
        `}
        style={{
          backgroundColor: '#F0EAE0',
          backdropFilter: 'blur(20px)',
          boxShadow: isOpen ? '4px 0 24px rgba(39,37,34,0.1)' : 'none',
        }}
      >
        {/* Brand */}
        <div
          className="h-14 flex items-center justify-between px-4 border-b border-sand-400/60 shrink-0"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group overflow-hidden"
            aria-label="Go to home"
          >
            <div
              className="w-8 h-8 flex items-center justify-center shrink-0 transition-transform group-hover:scale-95"
              style={{ background: '#272522', borderRadius: '6px' }}
            >
              <Warehouse className="w-4 h-4 text-sand-200" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-none overflow-hidden">
                <span className="text-[13px] font-black tracking-tight text-charcoal-900">
                  INNVORA
                </span>
                <span className="text-[9px] font-bold tracking-[0.18em] text-charcoal-400 uppercase mt-0.5">
                  Ops Platform
                </span>
              </div>
            )}
          </button>

          <button
            className="lg:hidden p-1 text-charcoal-400 hover:text-charcoal-800 transition-colors"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
          {!isCollapsed && (
            <p className="px-3 pb-2 pt-1 text-[9px] font-black text-charcoal-400 uppercase tracking-[0.18em]">
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
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `ops-nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Icon className="ops-nav-icon w-[15px] h-[15px] shrink-0" />
                {!isCollapsed && (
                  <span className="flex-1 text-[13px] truncate">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Nav */}
        <div
          className="p-2 border-t border-sand-400/60 space-y-0.5"
          style={{ paddingBottom: '12px' }}
        >
          {!isCollapsed && (
            <p className="px-3 pb-1 pt-1 text-[9px] font-black text-charcoal-400 uppercase tracking-[0.18em]">
              System
            </p>
          )}
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `ops-nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Icon className="ops-nav-icon w-[15px] h-[15px] shrink-0" />
                {!isCollapsed && (
                  <span className="text-[13px]">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
};
