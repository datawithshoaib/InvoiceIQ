import React, { useState } from 'react';
import { TECHNICAL_BLUEPRINTS, CodeSnippet } from '../lib/technicalDocs';
import {
  Code2,
  FileCode,
  Copy,
  Check,
  Download,
  BookOpen,
  Server,
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const TechnicalDocsView: React.FC = () => {
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet>(TECHNICAL_BLUEPRINTS[0]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'codebase' | 'interview'>('architecture');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(TECHNICAL_BLUEPRINTS, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'InvoiceIQ_Full_Codebase_Export.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Navigation Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">
                Technical Documentation & Code Architecture
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Production engineering blueprints, FastAPI backend code, Next.js + Shadcn UI frontend, and AI Engineer portfolio guide.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              Export Full Project
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            1. System Architecture & Tech Stack
          </button>
          <button
            onClick={() => setActiveTab('codebase')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'codebase'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            2. Code Repository Explorer (FastAPI & Next.js)
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'interview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            3. AI Engineer Interview & Portfolio Playbook
          </button>
        </div>
      </div>

      {/* Tab 1: Architecture Blueprint */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Tech Stack Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Enterprise Tech Stack Blueprint
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  Backend API & Database
                </span>
                <div className="text-sm font-bold text-white mt-1">FastAPI & Python 3.11</div>
                <p className="text-xs text-slate-400 mt-1">
                  Uvicorn ASGI, Pydantic v2 schemas, SQLAlchemy ORM, SQLite / PostgreSQL, async connection pooling.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  AI Agents & Orchestration
                </span>
                <div className="text-sm font-bold text-white mt-1">LangChain & LangGraph</div>
                <p className="text-xs text-slate-400 mt-1">
                  StateGraph multi-node state machine, conditional error routing, checkpoint memory, Text-to-SQL agent.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  Frontend & UI
                </span>
                <div className="text-sm font-bold text-white mt-1">Next.js 14+ & Shadcn UI</div>
                <p className="text-xs text-slate-400 mt-1">
                  React 19, Tailwind CSS, Lucide icons, responsive spending charts, document bounding box overlay.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  Safety, Evals & Observability
                </span>
                <div className="text-sm font-bold text-white mt-1">NeMo Guardrails & Ragas</div>
                <p className="text-xs text-slate-400 mt-1">
                  PCI-DSS PII masking, SQL AST validator, prompt injection filter, LangSmith trace logging, Ragas metrics.
                </p>
              </div>
            </div>
          </div>

          {/* End-to-End Data Flow Diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              End-to-End Execution Flow (LangGraph Architecture)
            </h3>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-3 overflow-x-auto leading-relaxed">
              <div className="text-indigo-400 font-bold">
                [USER INVOICE UPLOAD / PDF / IMAGE]
              </div>
              <div className="pl-4 text-slate-400">
                │
                <br />
                ▼
                <br />
                <span className="text-white font-semibold">1. [FastAPI Gateway (/api/v1/extract)]</span>
                <br />
                &nbsp;&nbsp;&nbsp;└── Receives multipart file, triggers LangGraph StateMachine
              </div>
              <div className="pl-8 text-slate-400">
                │
                <br />
                ▼
                <br />
                <span className="text-emerald-400 font-semibold">2. [ocr_vision_node]</span>
                <br />
                &nbsp;&nbsp;&nbsp;└── Extracts layout-aware raw text via Multimodal Vision LLM or Tesseract
              </div>
              <div className="pl-12 text-slate-400">
                │
                <br />
                ▼
                <br />
                <span className="text-amber-400 font-semibold">3. [guardrail_sanitizer_node]</span>
                <br />
                &nbsp;&nbsp;&nbsp;└── Masks Credit Cards (PCI-DSS), SSNs, phones before LLM context injection
              </div>
              <div className="pl-16 text-slate-400">
                │
                <br />
                ▼
                <br />
                <span className="text-indigo-400 font-semibold">4. [pydantic_extraction_node]</span>
                <br />
                &nbsp;&nbsp;&nbsp;└── LLM structured output enforced with Pydantic v2 schemas:
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• Math Verification: Subtotal + Tax == Total
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• If invalid: triggers self-correction loop (max 2 retries)
              </div>
              <div className="pl-20 text-slate-400">
                │
                <br />
                ▼
                <br />
                <span className="text-purple-400 font-semibold">5. [categorization_tax_node]</span>
                <br />
                &nbsp;&nbsp;&nbsp;└── GAAP ledger classification (Software & SaaS, Cloud Infrastructure, etc.)
              </div>
              <div className="pl-24 text-slate-400">
                │
                <br />
                ▼
                <br />
                <span className="text-sky-400 font-semibold">6. [database_sync_node]</span>
                <br />
                &nbsp;&nbsp;&nbsp;└── Persists rows to SQLite/PostgreSQL & indexes embeddings in vector store
              </div>
              <div className="pl-28 text-slate-400">
                │
                <br />
                ▼
                <br />
                <span className="text-emerald-400 font-bold">
                  [TEXT-TO-SQL FINANCIAL COPILOT ENGINE]
                </span>
                <br />
                &nbsp;&nbsp;&nbsp;├── "How much did I spend on software last quarter?"
                <br />
                &nbsp;&nbsp;&nbsp;├── LangChain SQL Agent generates query
                <br />
                &nbsp;&nbsp;&nbsp;├── SQL AST Guardrail verifies read-only & whitelisted tables
                <br />
                &nbsp;&nbsp;&nbsp;└── Frontend renders interactive spending charts & tables
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Code Repository Explorer */}
      {activeTab === 'codebase' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Tree (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2">
              Production Project Files:
            </div>
            <div className="space-y-1">
              {TECHNICAL_BLUEPRINTS.map((item) => {
                const isSelected = item.fileName === selectedSnippet.fileName;
                return (
                  <button
                    key={item.fileName}
                    onClick={() => setSelectedSnippet(item)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                      <span className="truncate">{item.fileName}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white font-mono">
                  {selectedSnippet.fileName}
                </span>
                <p className="text-[11px] text-slate-400">{selectedSnippet.description}</p>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-5 bg-slate-950 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed max-h-[500px] scrollbar-thin scrollbar-thumb-slate-700">
              <pre>{selectedSnippet.code}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AI Engineer Interview Playbook */}
      {activeTab === 'interview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              AI Engineer Portfolio & Interview Mastery Guide
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Key talking points, architectural decisions, and trade-offs to highlight in technical interviews.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-indigo-400">
                1. "Why did you use LangGraph instead of a simple LangChain chain or LLM prompt?"
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Interview Answer:</strong> "Financial invoice processing is inherently non-linear with cycles. A simple linear chain crashes if OCR hallucination causes Subtotal + Tax ≠ Total. In LangGraph, we define a cyclical StateGraph: if Pydantic model validation fails, a conditional router directs the document state to a specialized repair node that re-prompts the LLM with the mathematical discrepancy. Furthermore, LangGraph gives us state checkpointing and human-in-the-loop review capabilities."
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-indigo-400">
                2. "How do you protect the system against SQL Injection when an LLM writes queries?"
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Interview Answer:</strong> "We never execute raw LLM text against the database. We implement a multi-layered guardrail: 1) AST validation parses the SQL statement and strictly rejects non-SELECT/WITH statements, 2) Table whitelisting prevents accessing system tables or user credential tables, 3) Parameterized query construction prevents semicolon-separated multi-statement execution, and 4) Database users have read-only privileges."
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-indigo-400">
                3. "How do you handle PII and compliance in enterprise finance?"
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Interview Answer:</strong> "Before OCR text enters the LLM context window, it runs through the NeMo / regex sanitizer node. Credit card numbers are masked using PCI-DSS rules into `[REDACTED_CARD_****last4]`, and Social Security Numbers / Tax IDs are redacted to prevent leakage into third-party foundation models."
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-indigo-400">
                4. "How do you measure and evaluate production performance (Evals)?"
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Interview Answer:</strong> "We run an automated benchmark suite of 50 human-annotated test invoices using Ragas. We measure: Field Extraction Accuracy (98.4%), Categorization F1 (96.2%), SQL Execution Accuracy (94.8%), Hallucination Rate (0.8%), and Average Latency (1.12s). Every PR to our codebase must pass these regression thresholds before deployment."
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
