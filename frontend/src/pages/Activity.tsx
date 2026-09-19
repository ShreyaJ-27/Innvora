import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { ActivityTimelineTable } from '../components/activity/ActivityTimelineTable';
import { ActivityFilters } from '../components/activity/ActivityFilters';
import { ErrorState } from '../components/common/ErrorState';
import { useSearch } from '../hooks/useSearch';
import { Activity as ActivityIcon } from 'lucide-react';

export interface ActivityProps {
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
}

export const Activity: React.FC<ActivityProps> = ({
  selectedLocation,
  onLocationChange,
}) => {
  const [eventType, setEventType] = useState('ALL');
  const [skuSearch, setSkuSearch] = useState('');

  const {
    events,
    loading,
    error,
    refetch,
  } = useSearch({
    locationId: selectedLocation,
    eventType,
    q: skuSearch,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Inventory Activity"
        subtitle="Track stock movements and inventory changes across your network."
      />

      <div className="space-y-6">
        {/* Filters */}
        <ActivityFilters
          locationId={selectedLocation}
          onLocationChange={onLocationChange}
          eventType={eventType}
          onEventTypeChange={setEventType}
          skuSearch={skuSearch}
          onSkuSearchChange={setSkuSearch}
          onRefresh={refetch}
          isRefreshing={loading}
        />

        {/* Timeline Table */}
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <ActivityTimelineTable events={events} isLoading={loading} />
        )}
      </div>
    </PageContainer>
  );
};
