import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DemoEventSimulatorModal } from '../demo/DemoEventSimulatorModal';

export interface AppShellProps {
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  onEventProcessed?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  selectedLocation,
  onLocationChange,
  onEventProcessed,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex text-charcoal-900 font-sans ops-grid-bg"
      style={{ backgroundColor: '#E9E0D2' }}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          selectedLocation={selectedLocation}
          onLocationChange={onLocationChange}
          onOpenDemoSimulator={() => setIsDemoModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Demo Event Simulator Modal */}
      <DemoEventSimulatorModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onEventProcessed={onEventProcessed}
      />
    </div>
  );
};
