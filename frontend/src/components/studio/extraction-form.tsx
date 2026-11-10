"use client";

import { useRef, useState, useTransition } from "react";
import {
  CheckCircle2,
  CircleAlert,
  CircleSlash,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { ExtractionResponse, PipelineStep } from "@/lib/types";

const SAMPLE = `BLUE BOTTLE COFFEE
Receipt #BB-20241104-118
Date: 2024-11-04
2 x Oat Latte @ 6.25 = 12.50
1 x Croissant @ 4.75 = 4.75
Subtotal: 17.25
Tax (8.625%): 1.49
Total: 18.74
Paid: Visa 4111 1111 1111 1111`;

const STEP_ICON: Record<PipelineStep["status"], React.ReactNode> = {
  completed: <CheckCircle2 className="size-4 text-success" />,
  flagged: <CircleAlert className="size-4 text-warning" />,
  failed: <XCircle className="size-4 text-destructive" />,
  skipped: <CircleSlash className="size-4 text-muted-foreground" />,
};

const STATUS_BADGE = {
  validated: <Badge variant="success">Validated</Badge>,
  needs_review: <Badge variant="warning">Needs review</Badge>,
  rejected: <Badge variant="destructive">Rejected</Badge>,
} as const;

export function ExtractionForm({
  onExtracted,
}: {
  onExtracted: (invoiceId: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(SAMPLE);
  const [result, setResult] = useState<ExtractionResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData();
    const file = fileRef.current?.files?.[0];
    if (file) form.append("file", file);
    else form.append("text", text);

    startTransition(async () => {
      try {
        const response = await api<ExtractionResponse>("/extract", {
          method: "POST",
          body: form,
        });
        setResult(response);
        if (response.invoice) {
          onExtracted(response.invoice.id);
          toast.success(`Extracted ${response.invoice.vendorName}`);
        } else {
          toast.error("Document rejected by guardrails");
        }
        if (fileRef.current) fileRef.current.value = "";
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Extraction failed");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run the pipeline</CardTitle>
        <CardDescription>
          PDF (text layer), PNG/JPEG/WebP or plain text, up to 10 MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Upload a document</Label>
            <Input
              id="file"
              ref={fileRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp,.txt"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="text">…or paste receipt text</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-48 font-mono text-xs"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Upload />}
            {isPending ? "Running LangGraph…" : "Extract invoice"}
          </Button>
        </form>

        {result && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Execution trace</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {result.attempts} attempt{result.attempts === 1 ? "" : "s"}
                </Badge>
                {STATUS_BADGE[result.status]}
              </div>
            </div>
            <ol className="space-y-2">
              {result.steps.map((step, i) => (
                <li key={i} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-mono text-xs font-semibold">
                      {STEP_ICON[step.status]}
                      {step.node}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {step.durationMs.toFixed(0)} ms
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {step.message}
                  </p>
                </li>
              ))}
            </ol>
            {result.validationErrors.length > 0 && (
              <ul className="space-y-1 text-xs text-destructive">
                {result.validationErrors.map((err) => (
                  <li key={err}>• {err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
