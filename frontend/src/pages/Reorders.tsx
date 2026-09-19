import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { ReorderSummaryCards } from '../components/reorders/ReorderSummaryCards';
import { ReorderTable } from '../components/reorders/ReorderTable';
import { WhyReorderDrawer } from '../components/reorders/WhyReorderDrawer';
import { SearchInput } from '../components/common/SearchInput';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { ErrorState } from '../components/common/ErrorState';
import { useReorders } from '../hooks/useReorders';
import { ReorderRecommendation } from '../types/reorder';
import { RefreshCw, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { LOCATIONS } from '../components/layout/LocationSelector';

export interface ReordersProps {
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
}

export const Reorders: React.FC<ReordersProps> = ({
  selectedLocation,
  onLocationChange,
}) => {
  const [search, setSearch] = useState('');
  const [urgency, setUrgency] = useState('ALL');
  const [supplier, setSupplier] = useState('ALL');
  const [activeRecommendation, setActiveRecommendation] = useState<ReorderRecommendation | null>(null);
  const [orderSuccessBanner, setOrderSuccessBanner] = useState<string | null>(null);

  const {
    reorders,
    summary,
    loading,
    error,
    refetch,
  } = useReorders({
    locationId: selectedLocation,
    urgency,
    supplier,
    search,
  });

  // Collect distinct suppliers
  const supplierOptions = [
    { value: 'ALL', label: 'All Suppliers' },
    ...Array.from(new Set(reorders.map((r) => r.supplierName))).map((s) => ({
      value: s,
      label: s,
    })),
  ];

  const urgencyOptions = [
    { value: 'ALL', label: 'All Urgency Tiers' },
    { value: 'CRITICAL', label: 'Critical Only' },
    { value: 'REORDER_SOON', label: 'Reorder Soon' },
    { value: 'HEALTHY', label: 'Healthy (Safety Check)' },
  ];

  const handleApproveOrder = (rec: ReorderRecommendation) => {
    setActiveRecommendation(null);
    setOrderSuccessBanner(
      `Purchase Order for ${rec.recommendedQuantity} units of ${rec.productName} (${rec.sku}) successfully drafted and queued for supplier EDI dispatch.`
    );
    setTimeout(() => {
      setOrderSuccessBanner(null);
    }, 6000);
  };

  const handleExportBatchPO = () => {
    alert(
      `Exporting Batch Purchase Order for ${summary.recommendedUnits} units ($${summary.estimatedTotalValue.toLocaleString()}) across ${reorders.length} recommended SKUs.`
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Smart Reorders"
        subtitle="Actionable replenishment recommendations based on demand, stock coverage, and supplier lead times."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportBatchPO}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export Batch PO
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Success Notification Banner */}
      {orderSuccessBanner && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{orderSuccessBanner}</span>
          </div>
          <button
            onClick={() => setOrderSuccessBanner(null)}
            className="text-emerald-700 hover:underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Summary Cards */}
      <div className="mb-6">
        <ReorderSummaryCards summary={summary} isLoading={loading} />
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-card flex flex-col md:flex-row items-center justify-between gap-3 mb-6">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search recommendations..."
            sizeVariant="md"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          <Select
            options={LOCATIONS.map((l) => ({
              value: l.id,
              label: l.id === 'ALL' ? 'All Locations' : l.city,
            }))}
            value={selectedLocation}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onLocationChange(e.target.value)}
            sizeVariant="md"
          />

          <Select
            options={urgencyOptions}
            value={urgency}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUrgency(e.target.value)}
            sizeVariant="md"
          />

          <Select
            options={supplierOptions}
            value={supplier}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSupplier(e.target.value)}
            sizeVariant="md"
          />
        </div>
      </div>

      {/* Recommendations Table */}
      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <ReorderTable
          items={reorders}
          isLoading={loading}
          onWhyClick={(item) => setActiveRecommendation(item)}
        />
      )}

      {/* "Why Reorder?" Mathematical Reasoning Drawer */}
      <WhyReorderDrawer
        recommendation={activeRecommendation}
        isOpen={Boolean(activeRecommendation)}
        onClose={() => setActiveRecommendation(null)}
        onApproveOrder={handleApproveOrder}
      />
    </PageContainer>
  );
};
