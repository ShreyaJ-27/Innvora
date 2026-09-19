import { useState, useEffect, useCallback, useRef } from 'react';
import { InventoryEvent } from '../types/events';
import { searchInventoryEvents, SearchQueryParams } from '../api/search-api';

export function useSearch(initialParams?: SearchQueryParams) {
  const [data, setData] = useState<InventoryEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SearchQueryParams>(initialParams || {});

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEvents = useCallback(async (currentParams: SearchQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const items = await searchInventoryEvents(currentParams);
      setData(items);
    } catch (err: any) {
      setError(err.message || 'Failed to search inventory events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce search text input by 300ms
    debounceTimeoutRef.current = setTimeout(() => {
      fetchEvents(params);
    }, 250);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [params, fetchEvents]);

  const updateSearchQuery = (q: string) => {
    setParams((prev) => ({ ...prev, q }));
  };

  return {
    events: data,
    loading,
    error,
    refetch: () => fetchEvents(params),
    params,
    setParams,
    updateSearchQuery,
  };
}
