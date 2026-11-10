/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, NavTab } from './components/Header';
import { InvoiceStudio } from './components/InvoiceStudio';
import { TextToSqlCopilot } from './components/TextToSqlCopilot';
import { GuardrailsStudio } from './components/GuardrailsStudio';
import { EvalsDashboard } from './components/EvalsDashboard';
import { InvoiceLedger } from './components/InvoiceLedger';
import { TechnicalDocsView } from './components/TechnicalDocsView';
import { SAMPLE_INVOICES } from './lib/sampleData';
import { ExtractedInvoice } from './lib/types';
import { Server, Code, Shield, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('text-to-sql');
  const [invoices, setInvoices] = useState<ExtractedInvoice[]>(SAMPLE_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<ExtractedInvoice>(SAMPLE_INVOICES[0]);

  const handleAddInvoice = (newInv: ExtractedInvoice) => {
    setInvoices((prev) => [newInv, ...prev]);
    setSelectedInvoice(newInv);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        invoiceCount={invoices.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'text-to-sql' && <TextToSqlCopilot invoices={invoices} />}

        {activeTab === 'extraction-studio' && (
          <InvoiceStudio
            invoices={invoices}
            selectedInvoice={selectedInvoice}
            onSelectInvoice={setSelectedInvoice}
            onAddInvoice={handleAddInvoice}
          />
        )}

        {activeTab === 'guardrails' && <GuardrailsStudio />}

        {activeTab === 'evals' && <EvalsDashboard />}

        {activeTab === 'ledger' && (
          <InvoiceLedger
            invoices={invoices}
            onSelectInvoice={(inv) => {
              setSelectedInvoice(inv);
              setActiveTab('extraction-studio');
            }}
          />
        )}

        {activeTab === 'docs' && <TechnicalDocsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">InvoiceIQ</span>
            <span>•</span>
            <span>Production AI Engineering Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              FastAPI + Uvicorn
            </span>
            <span className="flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              LangChain & LangGraph
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              NeMo Guardrails
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
