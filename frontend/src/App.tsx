import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Reorders } from './pages/Reorders';
import { Activity } from './pages/Activity';
import { Search } from './pages/Search';

export function App() {
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [eventTriggerKey, setEventTriggerKey] = useState<number>(0);

  const handleEventProcessed = () => {
    // Increment trigger to force sub-views to refresh their datasets
    setEventTriggerKey((k) => k + 1);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <AppShell
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              onEventProcessed={handleEventProcessed}
            />
          }
        >
          {/* Index redirect to /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

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

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
