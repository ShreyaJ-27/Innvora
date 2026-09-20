import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Server } from 'lucide-react';
import { LOCATIONS, LocationOption } from '../layout/LocationSelector';
import { createProduct, fetchLocations, fetchSuppliers } from '../../api/inventory-api';
import { ProductRecord, SupplierRecord } from '../../types/inventory';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: () => void;
}

const CATEGORIES = [
  'Electronics', 'Mobile Accessories', 'Audio & Sound', 'Workspace & Office',
  'Gaming & Peripherals', 'Wearables & Health', 'Video & Streaming',
  'Home & Kitchen', 'Office Accessories', 'General',
];

const DEFAULT_SUPPLIERS: { id: string; name: string }[] = [
  { id: 'SUP-IND-01', name: 'Acoustics & Electronics India Pvt Ltd' },
  { id: 'SUP-IND-02', name: 'Bharat Power & Cables Manufacturing' },
  { id: 'SUP-IND-03', name: 'ErgoWorks Hardware & Metal Fabrication' },
  { id: 'SUP-IND-04', name: 'Apex Smart Wearables Logistics' },
  { id: 'SUP-GEN-01', name: 'General Logistics Supplier' },
];

interface FormData {
  productName: string;
  sku: string;
  category: string;
  supplierId: string;
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
  productName: '',
  sku: '',
  category: 'Electronics',
  supplierId: DEFAULT_SUPPLIERS[0].id,
  unitCost: '',
  sellingPrice: '',
  reorderPoint: '10',
  safetyStock: '5',
  moq: '1',
  packSize: '1',
  fulfillmentHub: 'LOC-BOM-01',
  initialStock: '',
};

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onProductAdded }) => {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdProduct, setCreatedProduct] = useState<ProductRecord | null>(null);
  const [hubLocations, setHubLocations] = useState<LocationOption[]>(LOCATIONS.filter((l) => l.id !== 'ALL'));
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(DEFAULT_SUPPLIERS);
  const [step, setStep] = useState(0);
  const steps = ['Product', 'Supplier', 'Inventory', 'Replenishment'];

  useEffect(() => {
    if (!isOpen) return;
    fetchLocations().then((locs) => {
      if (locs?.length) {
        setHubLocations(locs.map((l) => ({ id: l.locationId, name: l.locationName, city: l.city })));
      }
    }).catch(() => {});

    fetchSuppliers().then((sups: SupplierRecord[]) => {
      if (sups?.length) {
        setSuppliers(sups.map((s) => ({ id: s.supplierId, name: s.supplierName })));
      }
    }).catch(() => {});
  }, [isOpen]);

  const update = (field: keyof FormData, value: string) => {
    setErrorMessage(null);
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim() || !form.sku.trim()) {
      setErrorMessage('Product Name and SKU are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await createProduct({
        sku: form.sku.trim().toUpperCase(),
        name: form.productName.trim(),
        category: form.category,
        supplierId: form.supplierId || DEFAULT_SUPPLIERS[0].id,
        unitCost: Number(form.unitCost) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
        reorderPoint: Number(form.reorderPoint) || 10,
        safetyStock: Number(form.safetyStock) || 5,
        minimumOrderQuantity: Number(form.moq) || 1,
        packSize: Number(form.packSize) || 1,
        defaultLocationId: form.fulfillmentHub || 'LOC-BOM-01',
        initialStock: form.initialStock ? Number(form.initialStock) : undefined,
      });

      setCreatedProduct(result);
      setSubmitted(true);
      if (onProductAdded) {
        onProductAdded();
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (err?.code === 'CONFLICT' || err?.code === 'DUPLICATE_SKU' || msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('conflict')) {
        setErrorMessage(`SKU Conflict: Product with SKU "${form.sku.trim().toUpperCase()}" already exists in the catalog. Please enter a unique SKU.`);
      } else {
        setErrorMessage(msg || 'Failed to save product to catalog. Please check inputs and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setSubmitted(false);
    setErrorMessage(null);
    setCreatedProduct(null);
    setStep(0);
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
        <Server className="w-4 h-4 text-olive-600 shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-charcoal-800">Direct API Integration Active</p>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-olive-50 text-olive-700 border border-olive-200 uppercase">
              POST /products
            </span>
          </div>
          <p className="text-[11px] text-charcoal-500 mt-0.5">
            New products are validated for unique SKUs, persisted to DynamoDB with GSI1 indices, and initialized with warehouse stock baselines.
          </p>
        </div>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-terracotta-50 border border-terracotta-300 rounded-lg text-terracotta-800">
          <AlertTriangle className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold">{errorMessage}</p>
          </div>
        </div>
      )}

      {submitted && createdProduct ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-olive-50 border border-olive-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 text-olive-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-charcoal-900">Product successfully added to catalog</p>
            <p className="text-xs text-charcoal-500 mt-1">
              <span className="font-semibold text-charcoal-800">{createdProduct.name}</span> (<code className="font-mono">{createdProduct.sku}</code>) has been registered.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-sand-200 border border-sand-400 rounded-lg text-xs text-charcoal-600">
              <span>Product ID:</span>
              <code className="font-mono text-charcoal-900 font-semibold">{createdProduct.productId}</code>
            </div>
          </div>
          <div className="flex justify-center gap-3 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setForm(INITIAL_FORM);
                setSubmitted(false);
                setCreatedProduct(null);
                setErrorMessage(null);
              }}
            >
              Add Another Product
            </Button>
            <Button variant="primary" size="sm" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index)}
                className={`rounded-md border px-2 py-2 text-left transition-all ${
                  step === index
                    ? 'border-charcoal-800 bg-sand-200 shadow-[inset_0_-3px_0_#5A5349]'
                    : index < step
                    ? 'border-olive-200 bg-olive-50'
                    : 'border-sand-400 bg-sand-100 hover:bg-sand-200'
                }`}
              >
                <span className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-charcoal-500">
                  {label}
                  {index < step && <CheckCircle2 className="h-3.5 w-3.5 text-olive-600" />}
                </span>
              </button>
            ))}
          </div>

          {/* Product Identity */}
          {step === 0 && <div className="animate-rise-in">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-3">Product</p>
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
                <label className={labelClass}>SKU (Stock Keeping Unit) *</label>
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
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>}

          {/* Pricing & Costing */}
          {step === 1 && <div className="animate-rise-in">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-3">Supplier</p>
            <div className="mb-4">
              <label className={labelClass}>Supplier</label>
              <select
                className={inputClass}
                value={form.supplierId}
                onChange={(e) => update('supplierId', e.target.value)}
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Unit Cost (USD) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  className={inputClass}
                  placeholder="22.50"
                  value={form.unitCost}
                  onChange={(e) => update('unitCost', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Selling Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={inputClass}
                  placeholder="39.99"
                  value={form.sellingPrice}
                  onChange={(e) => update('sellingPrice', e.target.value)}
                />
              </div>
            </div>
          </div>}

          {/* Inventory Parameters */}
          {step === 3 && <div className="animate-rise-in">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-3">Replenishment</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Reorder Point</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="10"
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
                  placeholder="5"
                  value={form.safetyStock}
                  onChange={(e) => update('safetyStock', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Min Order Qty</label>
                <input
                  type="number"
                  min="1"
                  className={inputClass}
                  placeholder="1"
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
          </div>}

          {/* Initial Inventory */}
          {step === 2 && <div className="animate-rise-in">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-3">Inventory</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Fulfillment Hub</label>
                <select
                  className={inputClass}
                  value={form.fulfillmentHub}
                  onChange={(e) => update('fulfillmentHub', e.target.value)}
                >
                  {hubLocations.map((l) => (
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
          </div>}

          {/* Footer actions */}
          <div className="flex justify-between gap-3 border-t border-sand-300 pt-5">
            <Button type="button" variant="outline" size="md" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="md" disabled={step === 0 || isSubmitting} onClick={() => setStep((s) => Math.max(0, s - 1))} leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}>
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" variant="primary" size="md" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  Continue
                </Button>
              ) : (
                <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving Product...' : 'Register Product'}
                </Button>
              )}
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
