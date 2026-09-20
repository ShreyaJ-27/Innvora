import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { InventoryFilters } from '../components/inventory/InventoryFilters';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { ProductDetailsDrawer } from '../components/inventory/ProductDetailsDrawer';
import { WhyReorderDrawer } from '../components/reorders/WhyReorderDrawer';
import { AddProductModal } from '../components/inventory/AddProductModal';
import { ImportInventoryModal } from '../components/inventory/ImportInventoryModal';
import { ErrorState } from '../components/common/ErrorState';
import { Button } from '../components/common/Button';
import { useInventory } from '../hooks/useInventory';
import { useReorders } from '../hooks/useReorders';
import { ProductInventory } from '../types/inventory';
import { ReorderRecommendation } from '../types/reorder';
import { CheckCircle2, Clock, AlertTriangle, Package, Layers, Plus, Upload } from 'lucide-react';

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

  const totalCount = inventory.length;
  const healthyCount = inventory.filter((i) => i.status === 'HEALTHY').length;
  const reorderSoonCount = inventory.filter((i) => i.status === 'REORDER_SOON').length;
  const criticalCount = inventory.filter((i) => i.status === 'CRITICAL').length;
  const overstockedCount = inventory.filter((i) => i.status === 'OVERSTOCKED').length;

  const currentReorderRecommendation = selectedProduct
    ? reorders.find((r) => r.sku === selectedProduct.sku)
    : null;

  const statusCards = [
    {
      label: 'All SKUs', count: totalCount, filter: 'ALL',
      icon: <Package className="w-3.5 h-3.5" />,
      active: 'border-charcoal-700 bg-sand-200',
      inactive: 'border-sand-400 bg-sand-100',
      textActive: 'text-charcoal-900',
      textInactive: 'text-charcoal-500',
    },
    {
      label: 'Healthy', count: healthyCount, filter: 'HEALTHY',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      active: 'border-olive-300 bg-olive-50',
      inactive: 'border-sand-400 bg-sand-100',
      textActive: 'text-olive-800',
      textInactive: 'text-charcoal-500',
    },
    {
      label: 'Reorder Soon', count: reorderSoonCount, filter: 'REORDER_SOON',
      icon: <Clock className="w-3.5 h-3.5" />,
      active: 'border-terracotta-200 bg-terracotta-50',
      inactive: 'border-sand-400 bg-sand-100',
      textActive: 'text-terracotta-700',
      textInactive: 'text-charcoal-500',
    },
    {
      label: 'Critical', count: criticalCount, filter: 'CRITICAL',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      active: 'border-terracotta-400 bg-terracotta-100',
      inactive: 'border-sand-400 bg-sand-100',
      textActive: 'text-terracotta-800',
      textInactive: 'text-charcoal-500',
    },
    {
      label: 'Overstocked', count: overstockedCount, filter: 'OVERSTOCKED',
      icon: <Layers className="w-3.5 h-3.5" />,
      active: 'border-charcoal-500 bg-sand-300',
      inactive: 'border-sand-400 bg-sand-100',
      textActive: 'text-charcoal-800',
      textInactive: 'text-charcoal-500',
      extra: 'col-span-2 sm:col-span-1',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Stock Management"
        title="Inventory"
        subtitle="Monitor and manage stock levels across every fulfillment hub."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => setIsImportModalOpen(true)}
            >
              Import CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Product
            </Button>
          </div>
        }
      />

      {/* Status Filter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {statusCards.map((card) => {
          const isActive = status === card.filter;
          return (
            <div
              key={card.filter}
              onClick={() => setStatus(card.filter)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${card.extra ?? ''} ${
                isActive ? card.active : card.inactive
              }`}
              style={{ boxShadow: '0 1px 3px rgba(39,37,34,0.06)' }}
            >
              <div className={`flex items-center justify-between text-xs font-medium mb-1.5 ${
                isActive ? card.textActive : card.textInactive
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
                {card.icon}
              </div>
              <div className={`text-2xl font-extrabold leading-none ${
                isActive ? card.textActive : 'text-charcoal-800'
              }`}>{card.count}</div>
            </div>
          );
        })}
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

      {/* Table or Error */}
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

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Import Inventory Manifest Modal */}
      <ImportInventoryModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </PageContainer>
  );
};
