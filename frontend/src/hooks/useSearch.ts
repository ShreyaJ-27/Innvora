import { useState, useEffect, useCallback, useRef } from 'react';
import { InventoryEvent } from '../types/events';
import { searchInventoryEvents, SearchQueryParams } from '../api/search-api';

export function useSearch(initialParams?: SearchQueryParams) {
  const [data, setData] = useState<InventoryEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SearchQueryParams>(initialParams || {});

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEvents = useCallback(async (currentParams: SearchQueryParams) => {
    // searchInventoryEvents guards against empty params internally and returns []
    // without calling the API — but we still want to show loading briefly.
    setLoading(true);
    setError(null);
    try {
      const items = await searchInventoryEvents(currentParams);
      setData(items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to search inventory events';
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

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
