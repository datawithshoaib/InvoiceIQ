import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { GuardrailsPlayground } from "@/components/guardrails/guardrails-playground";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Guardrails" };

export default function GuardrailsPage() {
  return (
    <>
      <PageHeader
        icon={ShieldCheck}
        title="Guardrails & Safety"
        description="Interactive testbenches for the backend guardrails that protect both agents: PII redaction, prompt-injection detection, AST-based SQL validation and financial math checks."
      />
      <GuardrailsPlayground />
    </>
  );
}
