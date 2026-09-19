import { useState, useEffect, useCallback } from 'react';
import { InventoryHealthSummary, LocationInventorySummary } from '../types/inventory';
import { getInventoryHealth } from '../api/inventory-api';

export function useInventoryHealth(locationId?: string) {
  const [summary, setSummary] = useState<InventoryHealthSummary | null>(null);
  const [locations, setLocations] = useState<LocationInventorySummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInventoryHealth(locationId);
      setSummary(res.summary);
      setLocations(res.locations);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch inventory health';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return {
    summary,
    locations,
    loading,
    error,
    refetch: fetchHealth,
  };
}
