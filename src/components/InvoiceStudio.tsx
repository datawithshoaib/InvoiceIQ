import React, { useState } from 'react';
import { ExtractedInvoice, LangGraphStep } from '../lib/types';
import { SAMPLE_INVOICES } from '../lib/sampleData';
import { validateInvoiceMath } from '../lib/guardrails';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  Eye,
  Code2,
  DollarSign,
  Tag,
  Calendar,
} from 'lucide-react';

interface Props {
  invoices: ExtractedInvoice[];
  onSelectInvoice: (invoice: ExtractedInvoice) => void;
  selectedInvoice: ExtractedInvoice;
  onAddInvoice: (invoice: ExtractedInvoice) => void;
}

export const InvoiceStudio: React.FC<Props> = ({
  invoices,
  onSelectInvoice,
  selectedInvoice,
  onAddInvoice,
}) => {
  const [viewMode, setViewMode] = useState<'receipt' | 'ocr' | 'pydantic'>('receipt');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(5);

  const mathCheck = validateInvoiceMath(
    selectedInvoice.subtotal,
    selectedInvoice.tax,
    selectedInvoice.total
  );

  const graphSteps: LangGraphStep[] = [
    {
      id: 'step-1',
      nodeName: 'ocr_vision_node',
      status: 'completed',
      inputStateSummary: `File: ${selectedInvoice.fileName}`,
      outputStateSummary: `Extracted ${selectedInvoice.rawText?.length || 240} chars layout-aware text`,
      durationMs: 140,
    },
    {
      id: 'step-2',
      nodeName: 'guardrail_sanitizer_node',
      status: 'completed',
      inputStateSummary: 'Raw OCR buffer',
      outputStateSummary: `PCI-DSS check passed; Card ending in ${selectedInvoice.paymentMethod.slice(-4)} sanitized`,
      durationMs: 45,
    },
    {
      id: 'step-3',
      nodeName: 'pydantic_extraction_node',
      status: 'completed',
      inputStateSummary: 'Sanitized document buffer',
      outputStateSummary: `Pydantic v2 schema validated (${selectedInvoice.lineItems.length} items parsed)`,
      durationMs: 290,
    },
    {
      id: 'step-4',
      nodeName: 'categorization_tax_node',
      status: 'completed',
      inputStateSummary: `Vendor: ${selectedInvoice.vendorName}`,
      outputStateSummary: `Assigned category: "${selectedInvoice.category}"`,
      durationMs: 85,
    },
    {
      id: 'step-5',
      nodeName: 'database_sync_node',
      status: 'completed',
      inputStateSummary: 'Validated Invoice Model',
      outputStateSummary: 'Written to SQLite / PostgreSQL & Vector DB',
      durationMs: 30,
    },
  ];

  const handleSimulateNewUpload = () => {
    setIsProcessing(true);
    setActiveStepIdx(0);

    const interval = setInterval(() => {
      setActiveStepIdx((prev) => {
        if (prev >= 4) {
          clearInterval(interval);
          setIsProcessing(false);
          return 5;
        }
        return prev + 1;
      });
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Invoices Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              Document Vision & LangGraph Extraction Studio
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select or ingest receipts to trace OCR tokenization, Pydantic schema validation, and graph state transitions.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSimulateNewUpload}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {isProcessing ? 'Processing Graph...' : 'Re-Run LangGraph Pipeline'}
            </button>
          </div>
        </div>

        {/* Invoice Presets Row */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Loaded Invoices & Receipts ({invoices.length}):
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
            {invoices.map((inv) => {
              const isSelected = inv.id === selectedInvoice.id;
              return (
                <button
                  key={inv.id}
                  onClick={() => onSelectInvoice(inv)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="font-semibold">{inv.vendorName.split(' ')[0]}</span>
                  <span className="text-slate-400 font-mono">${inv.total.toFixed(2)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left (Document & OCR), Right (LangGraph Pipeline & Pydantic Data) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Document Viewer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            {/* View Mode Switcher */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                {selectedInvoice.fileName}
              </span>
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
                <button
                  onClick={() => setViewMode('receipt')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'receipt' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Receipt
                </button>
                <button
                  onClick={() => setViewMode('ocr')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'ocr' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Raw OCR
                </button>
                <button
                  onClick={() => setViewMode('pydantic')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'pydantic' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pydantic JSON
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-6 bg-slate-950/70 min-h-[420px] flex flex-col justify-between font-mono text-xs">
              {viewMode === 'receipt' && (
                <div className="bg-white text-slate-900 p-6 rounded-xl shadow-2xl space-y-4 font-mono relative">
                  {/* Watermark / Bounding Box Overlays */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                    <div>
                      <div className="font-extrabold text-base tracking-tight text-slate-950">
                        {selectedInvoice.vendorName}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {selectedInvoice.vendorAddress || 'San Francisco, CA'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px] border border-indigo-200">
                        INVOICE
                      </span>
                      <div className="text-[11px] font-semibold text-slate-700 mt-1">
                        #{selectedInvoice.invoiceNumber}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 py-1">
                    <div>
                      <span className="text-slate-400">Date: </span>
                      <span className="font-medium text-slate-800">{selectedInvoice.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400">Payment: </span>
                      <span className="font-medium text-slate-800">{selectedInvoice.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Description</span>
                      <span>Amount</span>
                    </div>
                    {selectedInvoice.lineItems.map((li) => (
                      <div key={li.id} className="flex justify-between items-center text-[11px] py-1 border-b border-slate-100">
                        <div className="pr-2">
                          <div className="font-medium text-slate-800">{li.description}</div>
                          <div className="text-[10px] text-slate-500">
                            Qty {li.quantity} × ${li.unitPrice.toFixed(2)}
                          </div>
                        </div>
                        <div className="font-semibold text-slate-900">${li.amount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="pt-2 space-y-1 text-right text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax / Surcharge</span>
                      <span>${selectedInvoice.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-950 text-sm pt-2 border-t border-slate-300">
                      <span>Total Due</span>
                      <span className="text-indigo-600">${selectedInvoice.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-[9px] text-center text-slate-400 pt-3 border-t border-dashed border-slate-200">
                    Thank you for your business. Verified by InvoiceIQ Vision Guardrail.
                  </div>
                </div>
              )}

              {viewMode === 'ocr' && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedInvoice.rawText || 'No raw OCR stream available'}
                </div>
              )}

              {viewMode === 'pydantic' && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-emerald-400 overflow-x-auto">
                  <pre>{JSON.stringify(selectedInvoice, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Confidence & Speed Footer */}
            <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Confidence:{' '}
                <strong className="text-emerald-400">
                  {Math.round(selectedInvoice.confidenceScore * 100)}%
                </strong>
              </span>
              <span className="text-slate-400">
                Processing Latency:{' '}
                <strong className="text-indigo-300">{selectedInvoice.processingTimeMs}ms</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: LangGraph Execution Trace & Pydantic Schema Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* LangGraph State Machine Trace */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">LangGraph Execution DAG</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                All Nodes Passed
              </span>
            </div>

            {/* Step Pipeline */}
            <div className="mt-4 space-y-3">
              {graphSteps.map((step, idx) => {
                const isStepActive = isProcessing ? idx === activeStepIdx : true;
                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isStepActive
                        ? 'bg-slate-800/60 border-indigo-500/50'
                        : 'bg-slate-950/40 border-slate-800/80 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center text-xs font-mono font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {step.nodeName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">{step.durationMs}ms</span>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                      <div className="bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono text-[11px]">
                        <span className="text-slate-500">In: </span>
                        {step.inputStateSummary}
                      </div>
                      <div className="bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono text-[11px]">
                        <span className="text-slate-500">Out: </span>
                        {step.outputStateSummary}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pydantic Schema Validation & Financial Math Check */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Pydantic v2 Integrity & Math Guard</h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  mathCheck.isValid
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {mathCheck.isValid ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" /> Math Verified
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" /> Discrepancy Flagged
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-slate-300">{mathCheck.details}</p>

            {/* Extracted Key-Value Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Vendor</div>
                <div className="text-sm font-bold text-white truncate mt-0.5">
                  {selectedInvoice.vendorName}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Category</div>
                <div className="text-sm font-bold text-indigo-400 truncate mt-0.5">
                  {selectedInvoice.category}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Date</div>
                <div className="text-sm font-bold text-white truncate mt-0.5">
                  {selectedInvoice.date}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Amount</div>
                <div className="text-sm font-bold text-emerald-400 truncate mt-0.5">
                  ${selectedInvoice.total.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
