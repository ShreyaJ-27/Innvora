import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { EventSearchFilters } from '../components/search/EventSearchFilters';
import { EventSearchResults } from '../components/search/EventSearchResults';
import { ErrorState } from '../components/common/ErrorState';
import { useSearch } from '../hooks/useSearch';
import { Card } from '../components/common/Card';
import { Database, Search as SearchIcon } from 'lucide-react';

export interface SearchProps {
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
}

export const Search: React.FC<SearchProps> = ({
  selectedLocation,
  onLocationChange,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const {
    events,
    loading,
    error,
    params,
    setParams,
    refetch,
  } = useSearch({
    q: initialQuery,
    locationId: selectedLocation,
    eventType: 'ALL',
  });

  // Sync with URL query parameter changes
  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    if (urlQ !== params.q) {
      setParams((prev) => ({ ...prev, q: urlQ }));
    }
  }, [searchParams]);

  // Keep location synced with global selector if not manually changed
  useEffect(() => {
    setParams((prev) => ({ ...prev, locationId: selectedLocation }));
  }, [selectedLocation]);

  const handleQueryChange = (val: string) => {
    setParams((prev) => ({ ...prev, q: val }));
    if (val) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Historical Event Search"
        subtitle="Full-text OpenSearch querying across telemetry logs, sales transactions, receipts, and audits."
      />

      <div className="space-y-6">
        {/* Search Input and Filter Card */}
        <Card noPadding className="p-5 bg-white border-slate-200">
          <EventSearchFilters
            query={params.q || ''}
            onQueryChange={handleQueryChange}
            locationId={params.locationId || 'ALL'}
            onLocationChange={(loc) => {
              onLocationChange(loc);
              setParams((prev) => ({ ...prev, locationId: loc }));
            }}
            eventType={params.eventType || 'ALL'}
            onEventTypeChange={(type) => setParams((prev) => ({ ...prev, eventType: type }))}
          />
        </Card>

        {/* Results Metadata Strip */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>OpenSearch Index: <code className="text-slate-700 font-mono">stockpulse-events-2026</code></span>
          </div>
          <span>
            Found <strong className="text-slate-900">{events.length}</strong> matching indexed events
          </span>
        </div>

        {/* Results Table */}
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <EventSearchResults events={events} isLoading={loading} />
        )}
      </div>
    </PageContainer>
  );
};
