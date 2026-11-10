import React, { useState, useEffect } from 'react';
import { ExtractedInvoice, SQLQueryResult } from '../lib/types';
import { QUERY_PRESETS, generateSQLFromNaturalLanguage, executeSafeSQL } from '../lib/textToSql';
import { SpendingCharts } from './SpendingCharts';
import {
  Search,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Database,
  ArrowRight,
  Terminal,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface Props {
  invoices: ExtractedInvoice[];
}

export const TextToSqlCopilot: React.FC<Props> = ({ invoices }) => {
  const [queryInput, setQueryInput] = useState('How much did I spend on software last quarter?');
  const [activeResult, setActiveResult] = useState<SQLQueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Execute default query on mount or invoice change
  useEffect(() => {
    handleRunQuery(queryInput);
  }, [invoices]);

  const handleRunQuery = (questionText: string) => {
    setIsExecuting(true);
    setQueryInput(questionText);

    // Simulate agent latency & AST analysis
    setTimeout(() => {
      const generated = generateSQLFromNaturalLanguage(questionText);
      const res = executeSafeSQL(generated.sql, invoices, questionText);
      setActiveResult(res);
      setIsExecuting(false);
    }, 180);
  };

  return (
    <div className="space-y-6">
      {/* Search & Query Bar Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Ask InvoiceIQ (Text-to-SQL Agent)</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Ask arbitrary questions in natural English. LangChain generates verified, read-only SQL, validated against schema guardrails and executed over active receipts.
        </p>

        {/* Query Input Field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunQuery(queryInput);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="e.g. How much did I spend on software last quarter?"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isExecuting || !queryInput.trim()}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 whitespace-nowrap"
          >
            {isExecuting ? (
              'Generating SQL...'
            ) : (
              <>
                <span>Run Query</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Query Presets Chips */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Suggested Financial Queries:
          </div>
          <div className="flex gap-2 flex-wrap">
            {QUERY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleRunQuery(preset.question)}
                className="text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <span>{preset.question}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Execution Trace & Results */}
      {activeResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Generated SQL & Guardrails Verdict (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Generated SQL Terminal Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Generated SQL Query
                </span>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    activeResult.guardrailPassed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {activeResult.guardrailPassed ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" /> Guardrail Approved
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" /> Guardrail Blocked
                    </>
                  )}
                </span>
              </div>

              <div className="p-4 bg-slate-950/80 font-mono text-xs text-indigo-300 overflow-x-auto leading-relaxed">
                <code>{activeResult.query}</code>
              </div>

              <div className="p-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-slate-200">Execution Analysis:</div>
                <p className="text-slate-400">{activeResult.explanation}</p>
                <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {activeResult.executionTimeMs}ms
                  </span>
                  <span>{activeResult.rows.length} rows returned</span>
                </div>
              </div>
            </div>

            {/* Invoices Database Schema Overview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Active Database Schema (invoices)
              </h4>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">category</span>
                  <span className="text-indigo-400">VARCHAR(64)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">vendorName</span>
                  <span className="text-indigo-400">VARCHAR(128)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">date</span>
                  <span className="text-indigo-400">DATE (YYYY-MM-DD)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-300">total</span>
                  <span className="text-emerald-400">DECIMAL(10,2)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Charts & Data Table (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Charts */}
            <SpendingCharts result={activeResult} />

            {/* Result Table */}
            {activeResult.rows.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-200">
                    Query Results Table ({activeResult.rows.length} rows)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">SQLite / Memory</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        {activeResult.columns.map((col) => (
                          <th key={col} className="px-4 py-2.5">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                      {activeResult.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-850/50 transition-colors">
                          {activeResult.columns.map((col) => {
                            const val = row[col];
                            const isCurrency =
                              col.toLowerCase().includes('total') ||
                              col.toLowerCase().includes('spent') ||
                              col.toLowerCase().includes('subtotal') ||
                              col.toLowerCase().includes('tax');
                            return (
                              <td key={col} className="px-4 py-2.5 whitespace-nowrap">
                                {typeof val === 'number' && isCurrency
                                  ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                  : String(val ?? '')}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
