import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { InventoryFilters } from '../components/inventory/InventoryFilters';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { ProductDetailsDrawer } from '../components/inventory/ProductDetailsDrawer';
import { WhyReorderDrawer } from '../components/reorders/WhyReorderDrawer';
import { ErrorState } from '../components/common/ErrorState';
import { useInventory } from '../hooks/useInventory';
import { useReorders } from '../hooks/useReorders';
import { ProductInventory } from '../types/inventory';
import { ReorderRecommendation } from '../types/reorder';
import { CheckCircle2, Clock, AlertTriangle, Package, Layers } from 'lucide-react';

export interface InventoryProps {
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({
  selectedLocation,
  onLocationChange,
}) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState<ProductInventory | null>(null);
  const [whyReorderItem, setWhyReorderItem] = useState<ReorderRecommendation | null>(null);

  const {
    inventory,
    loading,
    error,
    refetch,
  } = useInventory({
    locationId: selectedLocation,
    status,
    search,
  });

  const { reorders } = useReorders({ locationId: selectedLocation });

  // Counts for top status strip
  const totalCount = inventory.length;
  const healthyCount = inventory.filter((i) => i.status === 'HEALTHY').length;
  const reorderSoonCount = inventory.filter((i) => i.status === 'REORDER_SOON').length;
  const criticalCount = inventory.filter((i) => i.status === 'CRITICAL').length;
  const overstockedCount = inventory.filter((i) => i.status === 'OVERSTOCKED').length;

  const currentReorderRecommendation = selectedProduct
    ? reorders.find((r) => r.sku === selectedProduct.sku)
    : null;

  return (
    <PageContainer>
      <PageHeader
        title="Inventory"
        subtitle="Search and monitor inventory across every location."
      />

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div
          onClick={() => setStatus('ALL')}
          className={`p-3.5 bg-white rounded-xl border shadow-card cursor-pointer transition-all ${
            status === 'ALL' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total SKUs</span>
            <Package className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">{totalCount}</div>
        </div>

        <div
          onClick={() => setStatus('HEALTHY')}
          className={`p-3.5 bg-white rounded-xl border shadow-card cursor-pointer transition-all ${
            status === 'HEALTHY' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
            <span>Healthy</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-800 mt-1">{healthyCount}</div>
        </div>

        <div
          onClick={() => setStatus('REORDER_SOON')}
          className={`p-3.5 bg-white rounded-xl border shadow-card cursor-pointer transition-all ${
            status === 'REORDER_SOON' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-700 font-medium">
            <span>Reorder Soon</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-800 mt-1">{reorderSoonCount}</div>
        </div>

        <div
          onClick={() => setStatus('CRITICAL')}
          className={`p-3.5 bg-white rounded-xl border shadow-card cursor-pointer transition-all ${
            status === 'CRITICAL' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-700 font-medium">
            <span>Critical</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-800 mt-1">{criticalCount}</div>
        </div>

        <div
          onClick={() => setStatus('OVERSTOCKED')}
          className={`p-3.5 bg-white rounded-xl border shadow-card cursor-pointer transition-all col-span-2 sm:col-span-1 ${
            status === 'OVERSTOCKED' ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-indigo-700 font-medium">
            <span>Overstocked</span>
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-indigo-800 mt-1">{overstockedCount}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-6">
        <InventoryFilters
          search={search}
          onSearchChange={setSearch}
          locationId={selectedLocation}
          onLocationChange={onLocationChange}
          status={status}
          onStatusChange={setStatus}
          onRefresh={refetch}
          isRefreshing={loading}
        />
      </div>

      {/* Table / Error Display */}
      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <InventoryTable
          items={inventory}
          isLoading={loading}
          onSelectProduct={(product) => setSelectedProduct(product)}
        />
      )}

      {/* Product Details Drawer */}
      <ProductDetailsDrawer
        product={selectedProduct}
        reorderRecommendation={currentReorderRecommendation}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onWhyReorder={(rec) => setWhyReorderItem(rec)}
      />

      {/* Why Reorder Drawer */}
      <WhyReorderDrawer
        recommendation={whyReorderItem}
        isOpen={Boolean(whyReorderItem)}
        onClose={() => setWhyReorderItem(null)}
      />
    </PageContainer>
  );
};
