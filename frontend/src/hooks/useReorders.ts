import { useState, useEffect, useCallback } from 'react';
import { ReorderRecommendation, ReorderSummary } from '../types/reorder';
import { getReorders, ReorderQueryParams } from '../api/reorder-api';

export function useReorders(initialParams?: ReorderQueryParams) {
  const [data, setData] = useState<ReorderRecommendation[]>([]);
  const [summary, setSummary] = useState<ReorderSummary>({
    criticalCount: 0,
    reorderSoonCount: 0,
    recommendedUnits: 0,
    estimatedTotalValue: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<ReorderQueryParams>(initialParams || {});

  const fetchReorders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // getReorders now returns { items, summary } from the backend
      const result = await getReorders(params);
      setData(result.items);
      setSummary(result.summary);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch replenishment recommendations';
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchReorders();
  }, [fetchReorders]);

  return {
    reorders: data,
    summary,
    loading,
    error,
    refetch: fetchReorders,
    params,
    setParams,
  };
}
