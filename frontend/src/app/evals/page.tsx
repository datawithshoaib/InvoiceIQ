import type { Metadata } from "next";
import { ChartColumn } from "lucide-react";

import { EvalsDashboard } from "@/components/evals/evals-dashboard";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Evals" };

export default function EvalsPage() {
  return (
    <>
      <PageHeader
        icon={ChartColumn}
        title="Evals & Benchmarks"
        description="Live evaluation suites from the backend. The guardrail suite is deterministic and runs in CI. The extraction suite calls the LLM and scores field-level accuracy against the annotated sample invoices."
      />
      <EvalsDashboard />
    </>
  );
}
