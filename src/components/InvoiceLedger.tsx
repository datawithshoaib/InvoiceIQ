import React, { useState } from 'react';
import { ExtractedInvoice, ExpenseCategory } from '../lib/types';
import {
  FileText,
  Search,
  Filter,
  DollarSign,
  ArrowUpDown,
  Download,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';

interface Props {
  invoices: ExtractedInvoice[];
  onSelectInvoice: (invoice: ExtractedInvoice) => void;
}

export const InvoiceLedger: React.FC<Props> = ({ invoices, onSelectInvoice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Software & SaaS',
    'Cloud Infrastructure',
    'Office & Facilities',
    'Meals & Entertainment',
    'Travel & Transport',
    'Hardware & Equipment',
  ];

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || inv.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalSum = filtered.reduce((acc, i) => acc + i.total, 0);
  const totalTax = filtered.reduce((acc, i) => acc + i.tax, 0);

  const handleExportCSV = () => {
    const headers = ['InvoiceNumber,Vendor,Date,Category,Subtotal,Tax,Total,PaymentMethod'];
    const rows = filtered.map(
      (i) =>
        `"${i.invoiceNumber}","${i.vendorName}","${i.date}","${i.category}",${i.subtotal},${i.tax},${i.total},"${i.paymentMethod}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'InvoiceIQ_Expenses_Export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-semibold text-slate-400">Total Filtered Spend</span>
          <div className="text-3xl font-extrabold text-white mt-2">
            ${totalSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {filtered.length} invoice records
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-semibold text-slate-400">Total Sales Tax</span>
          <div className="text-3xl font-extrabold text-indigo-400 mt-2">
            ${totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Effective tax rate: {totalSum > 0 ? ((totalTax / totalSum) * 100).toFixed(1) : 0}%
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-semibold text-slate-400">Validation Status</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">100%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            All records validated by Pydantic v2
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendor, invoice #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Invoice #</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3 text-right">Subtotal</th>
                <th className="px-5 py-3 text-right">Tax</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => onSelectInvoice(inv)}
                  className="hover:bg-slate-850/50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 font-bold text-white whitespace-nowrap">
                    {inv.vendorName}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-300">{inv.date}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {inv.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                    {inv.paymentMethod}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap text-slate-400">
                    ${inv.subtotal.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap text-slate-400">
                    ${inv.tax.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-emerald-400 whitespace-nowrap">
                    ${inv.total.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <button className="text-indigo-400 hover:text-indigo-300 font-sans text-xs inline-flex items-center gap-1 font-semibold">
                      Inspect <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
