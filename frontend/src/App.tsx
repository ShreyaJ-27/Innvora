import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Reorders } from './pages/Reorders';
import { Activity } from './pages/Activity';
import { Search } from './pages/Search';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';

export function App() {
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [eventTriggerKey, setEventTriggerKey] = useState<number>(0);

  const handleEventProcessed = () => {
    setEventTriggerKey((k) => k + 1);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* App shell — all authenticated/app routes */}
        <Route
          element={
            <AppShell
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              onEventProcessed={handleEventProcessed}
            />
          }
        >
          <Route
            path="/dashboard"
            element={
              <Dashboard
                key={`dash-${selectedLocation}-${eventTriggerKey}`}
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
              />
            }
          />

          <Route
            path="/inventory"
            element={
              <Inventory
                key={`inv-${selectedLocation}-${eventTriggerKey}`}
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
              />
            }
          />

          <Route
            path="/reorders"
            element={
              <Reorders
                key={`reord-${selectedLocation}-${eventTriggerKey}`}
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
              />
            }
          />

          <Route
            path="/activity"
            element={
              <Activity
                key={`act-${selectedLocation}-${eventTriggerKey}`}
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
              />
            }
          />

          <Route
            path="/search"
            element={
              <Search
                key={`search-${selectedLocation}-${eventTriggerKey}`}
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
              />
            }
          />

          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />

          {/* Catch-all inside app shell */}
          <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Global catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
