"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Download, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import type { Invoice } from "@/lib/types";

const CSV_COLUMNS = [
  "invoiceNumber",
  "vendorName",
  "date",
  "category",
  "subtotal",
  "tax",
  "total",
  "currency",
  "paymentMethod",
  "status",
] as const satisfies readonly (keyof Invoice)[];

function toCsv(rows: Invoice[]): string {
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    CSV_COLUMNS.join(","),
    ...rows.map((r) => CSV_COLUMNS.map((c) => escape(r[c])).join(",")),
  ].join("\n");
}

export function LedgerView({ invoices }: { invoices: Invoice[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(invoices.map((i) => i.category))).sort(),
    ],
    [invoices],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return invoices.filter(
      (inv) =>
        (category === "All" || inv.category === category) &&
        (!term ||
          inv.vendorName.toLowerCase().includes(term) ||
          inv.invoiceNumber.toLowerCase().includes(term)),
    );
  }, [invoices, search, category]);

  const total = filtered.reduce((sum, i) => sum + i.total, 0);
  const tax = filtered.reduce((sum, i) => sum + i.tax, 0);
  const validated = filtered.filter((i) => i.status === "validated").length;

  function exportCsv() {
    const url = URL.createObjectURL(
      new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" }),
    );
    const link = Object.assign(document.createElement("a"), {
      href: url,
      download: "invoiceiq-ledger.csv",
    });
    link.click();
    URL.revokeObjectURL(url);
  }

  const stats = [
    {
      label: "Total spend",
      value: formatCurrency(total),
      hint: `${filtered.length} invoices`,
    },
    {
      label: "Sales tax",
      value: formatCurrency(tax),
      hint: `Effective rate ${total > 0 ? ((tax / (total - tax)) * 100).toFixed(1) : "0.0"}%`,
    },
    {
      label: "Validated",
      value: filtered.length
        ? `${Math.round((validated / filtered.length) * 100)}%`
        : "—",
      hint: `${filtered.length - validated} need review`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="gap-2">
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{s.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {s.hint}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search"
                placeholder="Search vendor or invoice #"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={exportCsv}
              disabled={!filtered.length}
            >
              <Download /> Export CSV
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={c === category ? "default" : "outline"}
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    {inv.vendorName}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {inv.invoiceNumber}
                  </TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{inv.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inv.status === "validated" ? "success" : "warning"
                      }
                    >
                      {inv.status === "validated"
                        ? "Validated"
                        : "Needs review"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatCurrency(inv.subtotal, inv.currency)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatCurrency(inv.tax, inv.currency)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold tabular-nums">
                    {formatCurrency(inv.total, inv.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        href={`/studio?invoice=${encodeURIComponent(inv.id)}`}
                      >
                        Inspect <ChevronRight />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!filtered.length && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No invoices match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
