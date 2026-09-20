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
import { RefreshCw, Download, CheckCircle2, AlertTriangle, TrendingUp, Clock3 } from 'lucide-react';
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

  const { reorders, summary, loading, error, refetch } = useReorders({
    locationId: selectedLocation,
    urgency,
    supplier,
    search,
  });

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
      `Purchase order for ${rec.recommendedQuantity} units of ${rec.productName} (${rec.sku}) drafted and queued for supplier EDI dispatch.`
    );
    setTimeout(() => setOrderSuccessBanner(null), 6000);
  };

  const handleExportBatchPO = () => {
    const lines = [
      'Innvora — Batch Purchase Order Export',
      `Generated: ${new Date().toLocaleString('en-IN')}`,
      '',
      `Total SKUs: ${reorders.length}`,
      `Recommended Units: ${summary.recommendedUnits.toLocaleString()}`,
      `Estimated Value: ₹${summary.estimatedTotalValue.toLocaleString()}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innvora-batch-po.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Replenishment Intelligence"
        title="Replenishment Queue"
        subtitle="Actionable reorder recommendations based on stock coverage, demand velocity, and supplier lead times."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportBatchPO}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export PO
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

      {/* Success Banner */}
      {orderSuccessBanner && (
        <div className="mb-6 px-4 py-3 bg-olive-50 border border-olive-200 rounded-xl flex items-center justify-between text-olive-800 text-xs font-medium animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-olive-600 shrink-0" />
            <span>{orderSuccessBanner}</span>
          </div>
          <button
            onClick={() => setOrderSuccessBanner(null)}
            className="text-olive-700 hover:text-olive-900 font-semibold ml-4 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="ops-panel mb-6 p-5">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">Reorder Pressure</p>
            <h2 className="mt-1 text-2xl font-black text-charcoal-900">Recommendations ranked for action</h2>
            <p className="mt-1 text-xs text-charcoal-500">Live backend recommendations with server-side reasoning.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md border border-terracotta-300 bg-terracotta-50 p-3">
              <AlertTriangle className="mb-2 h-4 w-4 text-terracotta-700" />
              <p className="text-2xl font-black text-terracotta-800">{summary.criticalCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-terracotta-700">Critical</p>
            </div>
            <div className="rounded-md border border-sand-400 bg-sand-100 p-3">
              <Clock3 className="mb-2 h-4 w-4 text-terracotta-600" />
              <p className="text-2xl font-black text-charcoal-900">{summary.reorderSoonCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500">Soon</p>
            </div>
            <div className="rounded-md border border-sand-400 bg-sand-100 p-3">
              <TrendingUp className="mb-2 h-4 w-4 text-charcoal-600" />
              <p className="text-2xl font-black text-charcoal-900">{summary.recommendedUnits.toLocaleString()}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500">Units</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-5">
          <ReorderSummaryCards summary={summary} isLoading={loading} />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-sand-100 border border-sand-400 rounded-lg px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 mb-6" style={{ boxShadow: '0 1px 3px rgba(39,37,34,0.06)' }}>
        <div className="w-full md:w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search recommendations…"
          />
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          <Select
            options={LOCATIONS.map((l) => ({
              value: l.id,
              label: l.id === 'ALL' ? 'All Hubs' : l.city,
            }))}
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
          />
          <Select
            options={urgencyOptions}
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          />
          <Select
            options={supplierOptions}
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <ReorderTable
          items={reorders}
          isLoading={loading}
          onWhyClick={(item) => setActiveRecommendation(item)}
        />
      )}

      {/* Why Reorder Drawer */}
      <WhyReorderDrawer
        recommendation={activeRecommendation}
        isOpen={Boolean(activeRecommendation)}
        onClose={() => setActiveRecommendation(null)}
        onApproveOrder={handleApproveOrder}
      />
    </PageContainer>
  );
};
