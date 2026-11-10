"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Loader2, Play, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import type { EvalReport } from "@/lib/types";

function ReportView({ report }: { report: EvalReport }) {
  const [onlyFailures, setOnlyFailures] = useState(false);
  const cases = onlyFailures
    ? report.cases.filter((c) => !c.passed)
    : report.cases;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {report.metrics.map((m) => (
          <Card key={m.name} className="gap-3">
            <CardHeader>
              <CardDescription>{m.name}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {(m.score * 100).toFixed(1)}%
              </CardTitle>
              <CardAction>
                <Badge variant={m.passed ? "success" : "destructive"}>
                  {m.passed ? "Pass" : "Fail"}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={m.score * 100} />
              <p className="text-xs text-muted-foreground">
                Threshold {(m.threshold * 100).toFixed(0)}% · n={m.samples}
              </p>
              <p className="text-xs text-muted-foreground">{m.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cases</CardTitle>
          <CardDescription>
            Completed in {report.durationMs.toFixed(0)} ms
          </CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOnlyFailures((v) => !v)}
            >
              {onlyFailures ? "Show all" : "Failures only"}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Suite</TableHead>
                <TableHead>Case</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {cases.map((c, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono">{c.suite}</TableCell>
                  <TableCell>{c.case}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {c.expected}
                  </TableCell>
                  <TableCell className="font-mono">{c.actual}</TableCell>
                  <TableCell>
                    {c.passed ? (
                      <CheckCircle2 className="size-4 text-success" />
                    ) : (
                      <XCircle className="size-4 text-destructive" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!cases.length && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No failing cases.
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

function SuiteRunner({
  path,
  label,
  autoRun,
}: {
  path: string;
  label: string;
  autoRun?: boolean;
}) {
  const [report, setReport] = useState<EvalReport | null>(null);
  const [isPending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      try {
        setReport(await api<EvalReport>(path, { method: "POST" }));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Evaluation failed");
      }
    });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => (autoRun ? run() : undefined), []);

  return (
    <div className="space-y-6">
      <Button onClick={run} disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <Play />}
        {isPending ? "Running…" : label}
      </Button>
      {report && <ReportView report={report} />}
    </div>
  );
}

export function EvalsDashboard() {
  return (
    <Tabs defaultValue="guardrails">
      <TabsList>
        <TabsTrigger value="guardrails">Guardrails</TabsTrigger>
        <TabsTrigger value="extraction">Extraction (LLM)</TabsTrigger>
      </TabsList>
      <TabsContent value="guardrails" className="pt-4">
        <SuiteRunner
          path="/evals/guardrails"
          label="Run guardrail suite"
          autoRun
        />
      </TabsContent>
      <TabsContent value="extraction" className="pt-4">
        <SuiteRunner
          path="/evals/extraction?limit=3"
          label="Run extraction eval on 3 invoices"
        />
      </TabsContent>
    </Tabs>
  );
}
