import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle } from 'lucide-react';
import { LOCATIONS } from '../layout/LocationSelector';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'Electronics', 'Mobile Accessories', 'Audio & Sound', 'Workspace & Office',
  'Gaming & Peripherals', 'Wearables & Health', 'Video & Streaming',
  'Home & Kitchen', 'Office Accessories', 'General',
];

const SUPPLIERS = [
  'Acoustics & Electronics India Pvt Ltd',
  'Bharat Power & Cables Manufacturing',
  'ErgoWorks Hardware & Metal Fabrication',
  'Apex Smart Wearables Logistics',
  'General Logistics Supplier',
];

interface FormData {
  productName: string;
  sku: string;
  category: string;
  supplier: string;
  unitCost: string;
  sellingPrice: string;
  reorderPoint: string;
  safetyStock: string;
  moq: string;
  packSize: string;
  fulfillmentHub: string;
  initialStock: string;
}

const INITIAL_FORM: FormData = {
  productName: '', sku: '', category: 'Electronics', supplier: SUPPLIERS[0],
  unitCost: '', sellingPrice: '', reorderPoint: '', safetyStock: '',
  moq: '', packSize: '1', fulfillmentHub: LOCATIONS[1]?.id ?? '', initialStock: '',
};

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setSubmitted(false);
    onClose();
  };

  const inputClass =
    'w-full px-3 py-2 text-sm bg-sand-200 border border-sand-400 rounded-lg text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-1 focus:ring-charcoal-700 focus:border-charcoal-700 transition-colors';

  const labelClass = 'block text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Product"
      subtitle="Register a new SKU in the Innvora inventory catalog."
      maxWidth="2xl"
    >
      {/* Backend status notice */}
      <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-sand-200 border border-sand-400 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-terracotta-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-charcoal-800">Backend catalog endpoint not yet connected</p>
          <p className="text-[11px] text-charcoal-500 mt-0.5">
            The product onboarding UI is fully built. Backend persistence via{' '}
            <code className="font-mono bg-sand-300 px-1 rounded">POST /products</code> can be connected
            when the endpoint is available.
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-olive-50 border border-olive-200 flex items-center justify-center mx-auto">
            <svg className="w-5 h-5 text-olive-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-charcoal-900">Product staged for catalog addition</p>
            <p className="text-xs text-charcoal-500 mt-1">
              {form.productName} ({form.sku}) — this form data is ready for backend integration.
              No database write occurred in the current demo environment.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setForm(INITIAL_FORM); setSubmitted(false); }}>
              Add Another
            </Button>
            <Button variant="primary" size="sm" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Identity */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-3">Product Identity</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Product Name *</label>
                <input
                  required
                  type="text"
                  className={inputClass}
                  placeholder="e.g. 65W GaN Dual Port Fast Wall Charger"
                  value={form.productName}
                  onChange={(e) => update('productName', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>SKU *</label>
                <input
                  required
                  type="text"
                  className={inputClass}
                  placeholder="e.g. PROD-CHG-02"
                  value={form.sku}
                  onChange={(e) => update('sku', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Supplier</label>
                <select
                  className={inputClass}
                  value={form.supplier}
                  onChange={(e) => update('supplier', e.target.value)}
                >
                  {SUPPLIERS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t border-sand-300 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-3">Pricing</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Unit Cost (₹) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  placeholder="22.50"
                  value={form.unitCost}
                  onChange={(e) => update('unitCost', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Selling Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  placeholder="45.00"
                  value={form.sellingPrice}
                  onChange={(e) => update('sellingPrice', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Replenishment Parameters */}
          <div className="border-t border-sand-300 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-3">Replenishment Parameters</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Reorder Point *</label>
                <input
                  required
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="50"
                  value={form.reorderPoint}
                  onChange={(e) => update('reorderPoint', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Safety Stock</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="25"
                  value={form.safetyStock}
                  onChange={(e) => update('safetyStock', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>MOQ</label>
                <input
                  type="number"
                  min="1"
                  className={inputClass}
                  placeholder="100"
                  value={form.moq}
                  onChange={(e) => update('moq', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Pack Size</label>
                <input
                  type="number"
                  min="1"
                  className={inputClass}
                  placeholder="1"
                  value={form.packSize}
                  onChange={(e) => update('packSize', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Initial Inventory */}
          <div className="border-t border-sand-300 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-3">Initial Stock</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Fulfillment Hub</label>
                <select
                  className={inputClass}
                  value={form.fulfillmentHub}
                  onChange={(e) => update('fulfillmentHub', e.target.value)}
                >
                  {LOCATIONS.filter((l) => l.id !== 'ALL').map((l) => (
                    <option key={l.id} value={l.id}>{l.city} — {l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Initial Stock (units)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="0"
                  value={form.initialStock}
                  onChange={(e) => update('initialStock', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 border-t border-sand-300 pt-5">
            <Button type="button" variant="outline" size="md" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Stage Product
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
