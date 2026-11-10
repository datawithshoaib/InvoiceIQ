import { CheckCircle2, ShieldAlert, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/format";
import type { Invoice } from "@/lib/types";

export function InvoiceViewer({ invoice }: { invoice: Invoice }) {
  const money = (v: number) => formatCurrency(v, invoice.currency);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{invoice.vendorName}</CardTitle>
        <CardDescription className="font-mono text-xs">
          #{invoice.invoiceNumber} · {invoice.fileName}
        </CardDescription>
        <CardAction className="flex gap-2">
          <Badge variant="outline">{invoice.category}</Badge>
          {invoice.status === "validated" ? (
            <Badge variant="success">
              <CheckCircle2 /> Validated
            </Badge>
          ) : (
            <Badge variant="warning">
              <TriangleAlert /> Needs review
            </Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {(invoice.validationWarnings.length > 0 ||
          invoice.detectedPii.length > 0) && (
          <div className="space-y-1 rounded-md border border-warning/40 bg-warning/5 p-3 text-xs">
            {invoice.detectedPii.length > 0 && (
              <p className="flex items-center gap-2">
                <ShieldAlert className="size-3.5 text-warning" />
                Redacted before LLM: {invoice.detectedPii.join(", ")}
              </p>
            )}
            {invoice.validationWarnings.map((w) => (
              <p key={w} className="flex items-center gap-2">
                <TriangleAlert className="size-3.5 text-warning" /> {w}
              </p>
            ))}
          </div>
        )}

        <Tabs defaultValue="receipt">
          <TabsList>
            <TabsTrigger value="receipt">Receipt</TabsTrigger>
            <TabsTrigger value="raw">Source text</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="receipt" className="space-y-4 pt-2">
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                ["Date", invoice.date],
                ["Due", invoice.dueDate ?? "—"],
                ["Payment", invoice.paymentMethod ?? "—"],
                ["Latency", `${invoice.processingTimeMs.toFixed(0)} ms`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md bg-muted/50 p-2">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="truncate font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-2">
              {invoice.lineItems.map((li) => (
                <div key={li.id} className="flex justify-between gap-4 text-sm">
                  <div>
                    <p>{li.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {li.quantity} × {money(li.unitPrice)}
                    </p>
                  </div>
                  <span className="font-mono tabular-nums">
                    {money(li.amount)}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-1 font-mono text-sm tabular-nums">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{money(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>{money(invoice.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-primary">{money(invoice.total)}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="raw" className="pt-2">
            <pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
              {invoice.rawText ?? "No source text stored."}
            </pre>
          </TabsContent>

          <TabsContent value="json" className="pt-2">
            <pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
              {JSON.stringify(invoice, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
