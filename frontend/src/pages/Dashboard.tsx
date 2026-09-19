import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Calendar } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/common/Button';
import { DashboardMetrics } from '../components/dashboard/DashboardMetrics';
import { InventoryHealthChart } from '../components/dashboard/InventoryHealthChart';
import { StockTrendChart } from '../components/dashboard/StockTrendChart';
import { NeedsAttentionTable } from '../components/dashboard/NeedsAttentionTable';
import { LocationOverviewCards } from '../components/dashboard/LocationOverviewCards';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { SmartInsightCard } from '../components/dashboard/SmartInsightCard';
import { ErrorState } from '../components/common/ErrorState';
import { useInventoryHealth } from '../hooks/useInventoryHealth';
import { useInventory } from '../hooks/useInventory';
import { useReorders } from '../hooks/useReorders';
import { useSearch } from '../hooks/useSearch';

export interface DashboardProps {
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  selectedLocation,
  onLocationChange,
}) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    summary,
    locations,
    loading: healthLoading,
    error: healthError,
    refetch: refetchHealth,
  } = useInventoryHealth(selectedLocation);

  const {
    inventory,
    loading: invLoading,
    refetch: refetchInv,
  } = useInventory({ locationId: selectedLocation });

  const {
    reorders,
    loading: reordersLoading,
    refetch: refetchReorders,
  } = useReorders({ locationId: selectedLocation });

  const {
    events,
    loading: eventsLoading,
    refetch: refetchEvents,
  } = useSearch({ locationId: selectedLocation });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchHealth(),
      refetchInv(),
      refetchReorders(),
      refetchEvents(),
    ]);
    setIsRefreshing(false);
  };

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  if (healthError) {
    return (
      <PageContainer>
        <ErrorState
          title="Dashboard Telemetry Offline"
          message={healthError}
          onRetry={handleRefresh}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header with Title & Context Controls */}
      <PageHeader
        title="Inventory Overview"
        subtitle="Real-time visibility into your inventory health and replenishment needs."
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-subtle">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentDate}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <DashboardMetrics
          summary={summary}
          isLoading={healthLoading}
          onNavigateToReorders={() => navigate('/reorders')}
        />

        {/* Smart Replenishment Insight Callout Banner */}
        <SmartInsightCard
          criticalCount={summary?.criticalCount || 0}
          reorderSoonCount={summary?.reorderSoonCount || 0}
        />

        {/* Health Donut & Stock Trend Velocity Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InventoryHealthChart summary={summary} isLoading={healthLoading} />
          <StockTrendChart summary={summary} isLoading={healthLoading} />
        </div>

        {/* Needs Immediate Attention Table */}
        <NeedsAttentionTable
          items={inventory}
          reorders={reorders}
          isLoading={invLoading || reordersLoading}
        />

        {/* Fulfillment Hub / Location Overview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fulfillment Hub Network</h3>
              <p className="text-xs text-slate-500">Live operational capacity and stock safety by facility</p>
            </div>
          </div>
          <LocationOverviewCards
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={onLocationChange}
          />
        </div>

        {/* Live Activity Telemetry Feed */}
        <RecentActivityFeed events={events} isLoading={eventsLoading} />
      </div>
    </PageContainer>
  );
};
