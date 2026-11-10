"use client";

import { useState, useTransition } from "react";
import {
  ArrowRight,
  Clock,
  Loader2,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { QueryChart } from "@/components/copilot/query-chart";
import { ResultsTable } from "@/components/copilot/results-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { api } from "@/lib/api";
import type { QueryResponse } from "@/lib/types";

const PRESETS = [
  "How much did we spend on software in Q3 2024?",
  "What is our total spend by category?",
  "Who are our top 5 vendors by total spend?",
  "Show all invoices over $500 with vendor, date and tax",
  "Show monthly spending and tax for 2024",
];

export function Copilot() {
  const [question, setQuestion] = useState(PRESETS[0]);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(q: string) {
    setQuestion(q);
    setError(null);
    startTransition(async () => {
      try {
        setResult(
          await api<QueryResponse>("/query", {
            method: "POST",
            json: { question: q },
          }),
        );
      } catch (e) {
        setResult(null);
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (question.trim().length >= 3) run(question.trim());
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. How much did we spend on software last quarter?"
                className="h-11 pl-9"
                maxLength={500}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-11"
              disabled={isPending || question.trim().length < 3}
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ArrowRight />
              )}
              {isPending ? "Thinking…" : "Ask"}
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => run(preset)}
              >
                {preset}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>Query failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle>Generated SQL</CardTitle>
              <CardDescription>{result.explanation}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {result.status === "ok" ? (
                  <Badge variant="success">
                    <ShieldCheck /> Guardrail approved
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <ShieldAlert />{" "}
                    {result.status === "blocked"
                      ? "Blocked"
                      : "Execution error"}
                  </Badge>
                )}
                <Badge variant="secondary">
                  <RotateCcw /> {result.attempts} attempt
                  {result.attempts === 1 ? "" : "s"}
                </Badge>
                <Badge variant="secondary">
                  <Clock /> {(result.executionTimeMs / 1000).toFixed(2)}s
                </Badge>
              </div>
              {result.sql && (
                <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {result.sql}
                </pre>
              )}
              {result.violations.length > 0 && (
                <ul className="space-y-1 text-sm text-destructive">
                  {result.violations.map((v) => (
                    <li key={v}>• {v}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-7">
            {result.status === "ok" && <QueryChart result={result} />}
            {result.status === "ok" && result.rows.length > 0 && (
              <ResultsTable result={result} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
