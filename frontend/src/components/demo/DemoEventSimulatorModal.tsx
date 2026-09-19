import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { postInventoryEvent } from '../../api/events-api';
import { InventoryEventType } from '../../types/events';
import { CheckCircle2, ArrowRight, Layers, Radio, Sparkles } from 'lucide-react';
import { LOCATIONS } from '../layout/LocationSelector';

export interface DemoEventSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventProcessed?: () => void;
}

export const DemoEventSimulatorModal: React.FC<DemoEventSimulatorModalProps> = ({
  isOpen,
  onClose,
  onEventProcessed,
}) => {
  const [sku, setSku] = useState('SKU-ERG-902');
  const [locationId, setLocationId] = useState('LOC-BOM-01');
  const [eventType, setEventType] = useState<InventoryEventType>('SALE');
  const [quantity, setQuantity] = useState<number>(4);
  const [source, setSource] = useState('Shopify POS Webhook');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStage, setProcessingStage] = useState<'idle' | 'accepted' | 'processing' | 'completed'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const skuOptions = [
    { value: 'SKU-ERG-902', label: 'SKU-ERG-902 (Wireless Keyboard - Critical)' },
    { value: 'SKU-ANC-404', label: 'SKU-ANC-404 (Studio Headphones - Critical)' },
    { value: 'SKU-THERM-101', label: 'SKU-THERM-101 (Stainless Tumbler - Reorder Soon)' },
    { value: 'SKU-USB-C-240', label: 'SKU-USB-C-240 (Braided Cable - Reorder Soon)' },
    { value: 'SKU-LUM-DESK', label: 'SKU-LUM-DESK (LED Light Bar - Healthy)' },
    { value: 'SKU-DESK-MAT-XL', label: 'SKU-DESK-MAT-XL (Desk Pad XL - Overstocked)' },
  ];

  const eventTypeOptions = [
    { value: 'SALE', label: 'SALE (Reduces stock, triggers reorder evaluation)' },
    { value: 'RESTOCK', label: 'RESTOCK (Replenishment receipt, restores health)' },
    { value: 'RETURN', label: 'RETURN (Restores stock units)' },
    { value: 'TRANSFER_IN', label: 'TRANSFER_IN (Receipt from another hub)' },
    { value: 'TRANSFER_OUT', label: 'TRANSFER_OUT (Dispatched to another hub)' },
    { value: 'ADJUSTMENT', label: 'ADJUSTMENT (Cycle count reconciliation)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProcessingStage('accepted');
    setStatusMessage('Event dispatched to API Gateway (POST /inventory/events)...');

    try {
      const response = await postInventoryEvent({
        sku,
        locationId,
        eventType,
        quantity: Number(quantity),
        source,
      });

      // Pipeline simulation progression
      setTimeout(() => {
        setProcessingStage('processing');
        setStatusMessage('SQS message queued & consumed by Lambda Processor...');
      }, 400);

      setTimeout(() => {
        setProcessingStage('completed');
        setStatusMessage(response.message || 'DynamoDB & OpenSearch synchronized.');
        setIsSubmitting(false);

        // Notify parent to refetch
        if (onEventProcessed) {
          onEventProcessed();
        }
      }, 900);
    } catch (err: any) {
      setIsSubmitting(false);
      setProcessingStage('idle');
      setStatusMessage(`Error: ${err.message || 'Failed to dispatch event'}`);
    }
  };

  const handleReset = () => {
    setProcessingStage('idle');
    setStatusMessage('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Demo Event Simulator"
      subtitle="Simulate real-time inventory telemetry ingested via POST /inventory/events"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Architecture Pipeline Explanation */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
          <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-600" /> Event Stream Architecture
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Frontend → API Gateway → Ingest Lambda → AWS SQS → Processor Lambda → DynamoDB + OpenSearch
          </p>
        </div>

        {processingStage !== 'completed' ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target SKU</label>
              <Select
                options={skuOptions}
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full"
              />
            </div>

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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
              <Select
                options={eventTypeOptions}
                value={eventType}
                onChange={(e) => setEventType(e.target.value as InventoryEventType)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Source</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Shopify POS Webhook, Warehouse Inbound Scanner"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            {/* Pipeline progress banner */}
            {isSubmitting && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-xs text-blue-800 animate-pulse">
                <Layers className="w-4 h-4 text-blue-600 animate-spin" />
                <span>{statusMessage}</span>
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
            <h4 className="text-base font-bold text-slate-900">Event Successfully Processed</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">{statusMessage}</p>
            <p className="text-[11px] text-slate-400">
              Inventory balances, health indicators, and reorder metrics have been updated.
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
