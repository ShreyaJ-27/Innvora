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

/** Returns true when the params object has at least one meaningful filter. */
function hasActiveParams(params: {
  q?: string;
  locationId?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
}): boolean {
  return Boolean(
    params.q ||
    (params.locationId && params.locationId !== 'ALL') ||
    (params.eventType && params.eventType !== 'ALL') ||
    params.startDate ||
    params.endDate
  );
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Keep location synced with global selector
  useEffect(() => {
    setParams((prev) => ({ ...prev, locationId: selectedLocation }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation]);

  const handleQueryChange = (val: string) => {
    setParams((prev) => ({ ...prev, q: val }));
    if (val) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const isSearchActive = hasActiveParams(params);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Event Search"
        title="Inventory Search"
        subtitle="Full-text search across all inventory events indexed in Amazon OpenSearch."
      />

      <div className="space-y-6">
        {/* Search Input and Filter Card */}
        <Card noPadding className="p-5">
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
        {isSearchActive && (
          <div className="flex items-center justify-between text-xs text-charcoal-500 px-1">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-charcoal-400" />
              <span>OpenSearch Index: <code className="text-charcoal-700 font-mono">stockpulse-events-2026</code></span>
            </div>
            <span>
              Found <strong className="text-charcoal-900">{events.length}</strong> matching events
            </span>
          </div>
        )}

        {/* Results Table or Prompt */}
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !isSearchActive ? (
          <Card className="py-16">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sand-300 border border-sand-400 flex items-center justify-center">
                <SearchIcon className="w-5 h-5 text-charcoal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-700">Enter a search term or apply a filter</p>
                <p className="text-xs text-charcoal-400 mt-1 max-w-xs">
                  Search by SKU, product name, event type, or location to query the OpenSearch inventory event index.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <EventSearchResults events={events} isLoading={loading} />
        )}
      </div>
    </PageContainer>
  );
};
