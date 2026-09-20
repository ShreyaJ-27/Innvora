import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle, Download, Check } from 'lucide-react';

interface ImportInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  id: number;
  sku: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  unitCost: number;
  reorderPoint: number;
  status: 'VALID' | 'WARNING' | 'ERROR';
  issue?: string;
}

const SAMPLE_CSV = `SKU,Product Name,Category,Location,Quantity,Unit Cost,Reorder Point
SKU-ELEC-001,Wireless Ergonomic Mouse,Electronics,LOC-BOM-01,140,450.00,50
SKU-AUDIO-002,Noise Cancelling Studio Headphones,Audio & Sound,LOC-DEL-02,32,1850.00,40
SKU-OFFC-003,Aluminum Monitor Riser Stand,Workspace & Office,LOC-BLR-03,85,920.00,30
SKU-PWR-004,Braided Type-C Fast Cable (2m),Mobile Accessories,LOC-BOM-01,310,180.00,100
SKU-ELEC-001,Wireless Ergonomic Mouse,Electronics,LOC-BOM-01,50,450.00,50
SKU-INV-ERR,Compact Desk Humidifier,Home & Kitchen,LOC-HYD-04,-10,350.00,20`;

export const ImportInventoryModal: React.FC<ImportInventoryModalProps> = ({ isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const parseCsvText = (text: string) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length <= 1) return;

    const seenSkus = new Set<string>();
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      const sku = cols[0] || '';
      const name = cols[1] || '';
      const category = cols[2] || 'General';
      const location = cols[3] || 'LOC-BOM-01';
      const quantity = parseInt(cols[4] || '0', 10);
      const unitCost = parseFloat(cols[5] || '0');
      const reorderPoint = parseInt(cols[6] || '0', 10);

      let status: 'VALID' | 'WARNING' | 'ERROR' = 'VALID';
      let issue: string | undefined;

      if (!sku || !name) {
        status = 'ERROR';
        issue = 'Missing SKU or Product Name';
      } else if (isNaN(quantity) || quantity < 0) {
        status = 'ERROR';
        issue = 'Negative or invalid stock quantity';
      } else if (seenSkus.has(sku)) {
        status = 'WARNING';
        issue = 'Duplicate SKU in file — quantities will be aggregated';
      } else {
        seenSkus.add(sku);
      }

      rows.push({
        id: i,
        sku,
        name,
        category,
        location,
        quantity: isNaN(quantity) ? 0 : quantity,
        unitCost: isNaN(unitCost) ? 0 : unitCost,
        reorderPoint: isNaN(reorderPoint) ? 0 : reorderPoint,
        status,
        issue,
      });
    }

    setParsedRows(rows);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) parseCsvText(text);
    };
    reader.readAsText(selected);
  };

  const handleLoadDemo = () => {
    setFile(new File([SAMPLE_CSV], 'sample-inventory-manifest.csv', { type: 'text/csv' }));
    parseCsvText(SAMPLE_CSV);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'innvora-inventory-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    setIsProcessing(false);
    setIsComplete(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleStartImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 1200);
  };

  const validCount = parsedRows.filter((r) => r.status === 'VALID').length;
  const warningCount = parsedRows.filter((r) => r.status === 'WARNING').length;
  const errorCount = parsedRows.filter((r) => r.status === 'ERROR').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Inventory Manifest"
      subtitle="Bulk upload stock levels, SKUs, and reorder thresholds from CSV"
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleDownloadTemplate}
          >
            Download CSV Template
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              {isComplete ? 'Close' : 'Cancel'}
            </Button>
            {!isComplete && parsedRows.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartImport}
                disabled={isProcessing || validCount === 0}
              >
                {isProcessing ? 'Validating Batch...' : `Import ${validCount + warningCount} Valid SKUs`}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Upload Dropzone */}
        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-sand-400 hover:border-charcoal-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-sand-200/50 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 rounded-full bg-sand-300 group-hover:bg-sand-400 text-charcoal-700 flex items-center justify-center mx-auto mb-3 transition-colors">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-charcoal-900">
              Click to upload manifest or drag and drop
            </p>
            <p className="text-xs text-charcoal-500 mt-1">
              Supports standard UTF-8 CSV manifests (Max 5MB)
            </p>
            <div className="mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadDemo();
                }}
              >
                Load Sample Data Manifest
              </Button>
            </div>
          </div>
        )}

        {/* File & Validation Summary */}
        {file && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-sand-200 border border-sand-400 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-charcoal-900 text-sand-100 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-charcoal-900">{file.name}</div>
                  <div className="text-[11px] text-charcoal-500">
                    {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} rows detected
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Choose Different File
              </Button>
            </div>

            {/* Validation Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-olive-50 border border-olive-200 rounded-xl">
                <div className="flex items-center justify-between text-xs text-olive-800 font-medium">
                  <span>Ready to Import</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-bold text-olive-900 mt-1">{validCount}</div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between text-xs text-amber-800 font-medium">
                  <span>Warnings / Dups</span>
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-bold text-amber-900 mt-1">{warningCount}</div>
              </div>

              <div className="p-3 bg-terracotta-50 border border-terracotta-200 rounded-xl">
                <div className="flex items-center justify-between text-xs text-terracotta-800 font-medium">
                  <span>Invalid Rows</span>
                  <XCircle className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-bold text-terracotta-900 mt-1">{errorCount}</div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="border border-sand-400 rounded-xl overflow-hidden">
              <div className="px-3 py-2 bg-sand-300 border-b border-sand-400 text-xs font-semibold text-charcoal-700 flex justify-between items-center">
                <span>Manifest Preview (First {Math.min(parsedRows.length, 5)} Rows)</span>
                <span className="text-[11px] text-charcoal-500 font-normal">Parsed from client</span>
              </div>
              <div className="max-h-44 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-sand-300 bg-sand-100 text-charcoal-500 text-[11px]">
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">Product Name</th>
                      <th className="py-2 px-3">Hub</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">ROP</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-300 bg-sand-50">
                    {parsedRows.slice(0, 5).map((row) => (
                      <tr key={row.id} className="hover:bg-sand-100/70">
                        <td className="py-2 px-3 font-mono font-medium text-charcoal-900">{row.sku}</td>
                        <td className="py-2 px-3 truncate max-w-[140px] text-charcoal-800">{row.name}</td>
                        <td className="py-2 px-3 font-mono text-charcoal-600">{row.location}</td>
                        <td className="py-2 px-3 text-right font-medium text-charcoal-900">{row.quantity}</td>
                        <td className="py-2 px-3 text-right text-charcoal-600">{row.reorderPoint}</td>
                        <td className="py-2 px-3">
                          {row.status === 'VALID' && (
                            <Badge variant="healthy" size="sm">Valid</Badge>
                          )}
                          {row.status === 'WARNING' && (
                            <Badge variant="reorder" size="sm">Warning</Badge>
                          )}
                          {row.status === 'ERROR' && (
                            <Badge variant="critical" size="sm">Invalid</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Success or Simulated Pipeline Notice */}
            {isComplete ? (
              <div className="p-3.5 bg-olive-50 border border-olive-300 rounded-xl flex items-start gap-2.5">
                <Check className="w-4 h-4 text-olive-700 shrink-0 mt-0.5" />
                <div className="text-xs text-olive-900">
                  <div className="font-semibold">Simulated Import Successful</div>
                  <p className="mt-0.5 text-olive-800/90">
                    {validCount + warningCount} inventory items staged for catalog ingest. In production, this dispatches a batch event to AWS EventBridge → DynamoDB.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-sand-200 border border-sand-400 rounded-xl flex items-start gap-2 text-xs text-charcoal-600">
                <AlertTriangle className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Staging Mode:</strong> In this live demo environment, batch manifests are validated against DynamoDB schema rules. Full automated bulk ingest can be triggered via AWS CLI or S3 drop.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
