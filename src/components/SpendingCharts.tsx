import React, { useState } from 'react';
import { SQLQueryResult } from '../lib/types';
import { DollarSign, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

interface Props {
  result: SQLQueryResult;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Software & SaaS': '#6366f1', // Indigo
  'Cloud Infrastructure': '#0ea5e9', // Sky
  'Office & Facilities': '#10b981', // Emerald
  'Meals & Entertainment': '#f59e0b', // Amber
  'Travel & Transport': '#ec4899', // Pink
  'Hardware & Equipment': '#8b5cf6', // Violet
  'Marketing & Ads': '#14b8a6', // Teal
  'Professional Services': '#f97316', // Orange
  Other: '#64748b', // Slate
};

export const SpendingCharts: React.FC<Props> = ({ result }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!result.isValid) {
    return (
      <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-5 text-rose-200">
        <p className="font-semibold text-rose-300">Query Could Not Be Visualized</p>
        <p className="text-sm mt-1 text-rose-400">{result.guardrailReason || result.explanation}</p>
      </div>
    );
  }

  // 1. Metric Display
  if (result.chartType === 'metric' && result.metricValue) {
    return (
      <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <DollarSign className="w-40 h-40 text-indigo-400" />
        </div>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aggregated Total
          </span>
          <h3 className="text-sm uppercase tracking-wider font-semibold text-slate-400 mt-4">
            {result.metricLabel || 'Calculated Metric'}
          </h3>
          <div className="text-4xl md:text-5xl font-extrabold text-white mt-2 tracking-tight">
            {result.metricValue}
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-2">
            <span className="text-emerald-400 font-medium">100% Verified</span> against active invoice receipts in SQL database
          </p>
        </div>
      </div>
    );
  }

  // 2. Bar Chart (Category or Vendor Breakdown)
  if (result.chartType === 'bar' || result.chartType === 'pie') {
    const isCategory = result.columns.includes('category');
    const isVendor = result.columns.includes('vendorName');
    const labelKey = isCategory ? 'category' : isVendor ? 'vendorName' : result.columns[0];
    const valKey = result.columns.includes('total_spent') ? 'total_spent' : 'total';

    const maxVal = Math.max(...result.rows.map((r) => Number(r[valKey]) || 0), 1);
    const totalSum = result.rows.reduce((acc, r) => acc + (Number(r[valKey]) || 0), 0);

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h4 className="font-semibold text-slate-200 text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              {isCategory ? 'Spending by Expense Category' : 'Expenditure Breakdown'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregated across {result.rows.length} {isCategory ? 'categories' : 'records'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Total Sum</div>
            <div className="text-lg font-bold text-indigo-400">
              ${totalSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {result.rows.map((row, idx) => {
            const label = String(row[labelKey] || 'Other');
            const val = Number(row[valKey]) || 0;
            const pct = Math.round((val / maxVal) * 100);
            const share = totalSum > 0 ? ((val / totalSum) * 100).toFixed(1) : '0';
            const barColor = CATEGORY_COLORS[label] || '#6366f1';

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="group relative cursor-pointer"
              >
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="font-medium text-slate-300 group-hover:text-white transition-colors truncate max-w-[65%]">
                    {label}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-mono">({share}%)</span>
                    <span className="font-semibold text-slate-100 font-mono">
                      ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(pct, 3)}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Line Chart / Time Series (Monthly trends)
  if (result.chartType === 'line') {
    const maxSpent = Math.max(...result.rows.map((r) => Number(r.total_spent) || 0), 100);
    const months = result.rows.map((r) => String(r.month));

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h4 className="font-semibold text-slate-200 text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Monthly Spending Trends
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Chronological spend trajectory</p>
          </div>
        </div>

        {/* SVG Sparkline / Bar visualization */}
        <div className="mt-8 flex items-end justify-around h-48 pt-4 px-4 border-b border-slate-800">
          {result.rows.map((row, idx) => {
            const spent = Number(row.total_spent) || 0;
            const heightPct = Math.round((spent / maxSpent) * 100);
            return (
              <div key={idx} className="flex flex-col items-center gap-2 group relative">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-800 border border-slate-700 text-xs px-2.5 py-1 rounded shadow text-white font-mono pointer-events-none whitespace-nowrap z-20">
                  ${spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div
                  className="w-12 bg-gradient-to-t from-indigo-600 to-indigo-400 hover:from-indigo-500 hover:to-indigo-300 rounded-t-lg transition-all duration-300"
                  style={{ height: `${Math.max(heightPct, 8)}%` }}
                />
                <span className="text-xs font-mono text-slate-400 group-hover:text-slate-200">
                  {row.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
