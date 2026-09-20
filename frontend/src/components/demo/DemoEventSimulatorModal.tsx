import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { postInventoryEvent } from '../../api/events-api';
import { InventoryEventType } from '../../types/events';
import { CheckCircle2, ArrowRight, Layers, Radio } from 'lucide-react';
import { LOCATIONS } from '../layout/LocationSelector';

export interface DemoEventSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventProcessed?: () => void;
}

// Pre-defined SKU / productId pairs for convenience — update when real products are seeded.
const SKU_OPTIONS = [
  { sku: 'SKU-ERG-902',    productId: 'PROD-ERG-902',    label: 'SKU-ERG-902 — Wireless Keyboard' },
  { sku: 'SKU-ANC-404',    productId: 'PROD-ANC-404',    label: 'SKU-ANC-404 — Studio Headphones' },
  { sku: 'SKU-THERM-101',  productId: 'PROD-THERM-101',  label: 'SKU-THERM-101 — Stainless Tumbler' },
  { sku: 'SKU-USB-C-240',  productId: 'PROD-USB-C-240',  label: 'SKU-USB-C-240 — Braided USB-C Cable' },
  { sku: 'SKU-LUM-DESK',   productId: 'PROD-LUM-DESK',   label: 'SKU-LUM-DESK — LED Light Bar' },
  { sku: 'SKU-DESK-MAT-XL',productId: 'PROD-DESK-MAT-XL',label: 'SKU-DESK-MAT-XL — Desk Pad XL' },
];

const EVENT_TYPE_OPTIONS = [
  { value: 'SALE',         label: 'SALE — Reduces stock, triggers reorder evaluation' },
  { value: 'RESTOCK',      label: 'RESTOCK — Replenishment receipt, restores health' },
  { value: 'RETURN',       label: 'RETURN — Restores stock units' },
  { value: 'TRANSFER_IN',  label: 'TRANSFER_IN — Receipt from another hub' },
  { value: 'TRANSFER_OUT', label: 'TRANSFER_OUT — Dispatched to another hub' },
  { value: 'ADJUSTMENT',   label: 'ADJUSTMENT — Cycle count reconciliation' },
];

export const DemoEventSimulatorModal: React.FC<DemoEventSimulatorModalProps> = ({
  isOpen,
  onClose,
  onEventProcessed,
}) => {
  const [selectedSkuIndex, setSelectedSkuIndex] = useState(0);
  const [locationId, setLocationId] = useState('LOC-BOM-01');
  const [eventType, setEventType] = useState<InventoryEventType>('SALE');
  const [quantityChange, setQuantityChange] = useState<number>(4);
  const [source, setSource] = useState('Innvora Demo Simulator');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStage, setProcessingStage] = useState<'idle' | 'accepted' | 'processing' | 'completed'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedSku = SKU_OPTIONS[selectedSkuIndex];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setProcessingStage('accepted');
    setStatusMessage('Event dispatched to API Gateway (POST /inventory/events)…');

    try {
      const response = await postInventoryEvent({
        productId: selectedSku.productId,
        sku: selectedSku.sku,
        locationId,
        eventType,
        quantityChange: Number(quantityChange),
        timestamp: new Date().toISOString(),
        source,
      });

      setTimeout(() => {
        setProcessingStage('processing');
        setStatusMessage('SQS message queued & consumed by Lambda Processor…');
      }, 400);

      setTimeout(() => {
        setProcessingStage('completed');
        setStatusMessage(response.message || 'DynamoDB & OpenSearch synchronized.');
        setIsSubmitting(false);

        if (onEventProcessed) {
          // Delay refresh slightly to give async processing time to settle
          setTimeout(onEventProcessed, 1500);
        }
      }, 900);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setProcessingStage('idle');
      const message = err instanceof Error ? err.message : 'Failed to dispatch event';
      setErrorMessage(message);
    }
  };

  const handleReset = () => {
    setProcessingStage('idle');
    setStatusMessage('');
    setErrorMessage('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Event Simulator"
      subtitle="Submit a live inventory event via POST /inventory/events → SQS → Lambda"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Architecture pipeline explanation */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
          <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-600" /> Event Stream Architecture
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Frontend → API Gateway → Ingest Lambda → AWS SQS → Processor Lambda → DynamoDB + OpenSearch
          </p>
          <p className="text-[11px] mt-1 text-amber-600 font-medium">
            Note: Processing is async — inventory changes may take a few seconds to reflect.
          </p>
        </div>

        {processingStage !== 'completed' ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* SKU selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target SKU</label>
              <Select
                options={SKU_OPTIONS.map((s, i) => ({ value: String(i), label: s.label }))}
                value={String(selectedSkuIndex)}
                onChange={(e) => setSelectedSkuIndex(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                Product ID: <span className="font-mono text-slate-600">{selectedSku.productId}</span>
              </p>
            </div>

            {/* Location & Quantity row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <Select
                  options={LOCATIONS.filter((l) => l.id !== 'ALL').map((l) => ({
                    value: l.id,
                    label: `${l.name} (${l.city})`,
                  }))}
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity Change
                </label>
                <input
                  type="number"
                  min={-9999}
                  max={9999}
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Event type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
              <Select
                options={EVENT_TYPE_OPTIONS}
                value={eventType}
                onChange={(e) => setEventType(e.target.value as InventoryEventType)}
                className="w-full"
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Source</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Shopify POS Webhook, Warehouse Scanner"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>

            {/* Pipeline progress */}
            {isSubmitting && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-xs text-blue-800 animate-pulse">
                <Layers className="w-4 h-4 text-blue-600 animate-spin" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Error display */}
            {errorMessage && !isSubmitting && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                <strong>Error: </strong>{errorMessage}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Dispatch Event
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Event Accepted</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">{statusMessage}</p>
            <p className="text-[11px] text-slate-400">
              The event was queued to SQS. Allow a few seconds for inventory balances
              and reorder metrics to update asynchronously.
            </p>
            <div className="pt-4 flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Simulate Another
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
