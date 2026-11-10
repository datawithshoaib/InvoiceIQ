import React from 'react';
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  BarChart3,
  Database,
  BookOpen,
  Receipt,
} from 'lucide-react';

export type NavTab =
  | 'text-to-sql'
  | 'extraction-studio'
  | 'guardrails'
  | 'evals'
  | 'ledger'
  | 'docs';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  invoiceCount: number;
}

export const Header: React.FC<Props> = ({ activeTab, onTabChange, invoiceCount }) => {
  const tabs = [
    { id: 'text-to-sql' as NavTab, label: 'Ask InvoiceIQ', icon: Sparkles, badge: 'Copilot' },
    { id: 'extraction-studio' as NavTab, label: 'LangGraph Studio', icon: Cpu },
    { id: 'guardrails' as NavTab, label: 'Guardrails & Safety', icon: ShieldCheck },
    { id: 'evals' as NavTab, label: 'Evals & Benchmarks', icon: BarChart3 },
    { id: 'ledger' as NavTab, label: 'Expense Ledger', icon: Database, count: invoiceCount },
    { id: 'docs' as NavTab, label: 'FastAPI & Next.js Docs', icon: BookOpen, highlight: true },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Receipt className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">InvoiceIQ</span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Engineer Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                LangGraph Multi-Modal Extraction & Text-to-SQL Financial Agent
              </p>
            </div>
          </div>

          {/* Quick Status Badges */}
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              FastAPI & LangGraph Active
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-850">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : t.highlight
                    ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/60 hover:bg-indigo-900/40 hover:text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                <span>{t.label}</span>
                {t.badge && (
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-indigo-300'
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
                {t.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
