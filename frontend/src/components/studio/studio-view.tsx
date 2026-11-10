"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { ExtractionForm } from "@/components/studio/extraction-form";
import { InvoiceViewer } from "@/components/studio/invoice-viewer";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { Invoice } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StudioView({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("invoice") ?? invoices[0]?.id;
  const selected = invoices.find((i) => i.id === selectedId) ?? invoices[0];

  function select(id: string) {
    router.replace(`/studio?invoice=${encodeURIComponent(id)}`, {
      scroll: false,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <ExtractionForm
          onExtracted={(id) => {
            router.refresh();
            select(id);
          }}
        />
      </div>

      <div className="space-y-4 lg:col-span-7">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {invoices.map((inv) => (
            <Button
              key={inv.id}
              size="sm"
              variant={inv.id === selected?.id ? "default" : "outline"}
              onClick={() => select(inv.id)}
              className={cn(
                inv.status === "needs_review" &&
                  inv.id !== selected?.id &&
                  "border-warning/60",
              )}
            >
              {inv.vendorName.split(/[ ,]/)[0]}
              <span className="font-mono opacity-70">
                {formatCurrency(inv.total, inv.currency)}
              </span>
            </Button>
          ))}
        </div>
        {selected ? (
          <InvoiceViewer invoice={selected} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No invoices yet. Extract one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
