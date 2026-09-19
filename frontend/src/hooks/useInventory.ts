import { useState, useEffect, useCallback } from 'react';
import { ProductInventory } from '../types/inventory';
import { getInventory, InventoryQueryParams } from '../api/inventory-api';

export function useInventory(initialParams?: InventoryQueryParams) {
  const [data, setData] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<InventoryQueryParams>(initialParams || {});

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getInventory(params);
      setData(items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory: data,
    loading,
    error,
    refetch: fetchInventory,
    params,
    setParams,
  };
}
