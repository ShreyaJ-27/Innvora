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
      const items = await getReorders(params);
      setData(items);

      // Compute summary
      const critical = items.filter((i) => i.urgency === 'CRITICAL').length;
      const reorderSoon = items.filter((i) => i.urgency === 'REORDER_SOON').length;
      const totalUnits = items.reduce((acc, i) => acc + i.recommendedQuantity, 0);
      const totalCost = items.reduce((acc, i) => acc + i.estimatedCost, 0);

      setSummary({
        criticalCount: critical,
        reorderSoonCount: reorderSoon,
        recommendedUnits: totalUnits,
        estimatedTotalValue: totalCost,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch replenishment recommendations');
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
