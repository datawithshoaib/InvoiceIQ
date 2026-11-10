import { Suspense } from "react";
import type { Metadata } from "next";
import { Cpu } from "lucide-react";

import { BackendError } from "@/components/backend-error";
import { PageHeader } from "@/components/page-header";
import { StudioView } from "@/components/studio/studio-view";
import { Skeleton } from "@/components/ui/skeleton";
import { getInvoices } from "@/lib/server-api";

export const metadata: Metadata = { title: "Extraction Studio" };

async function StudioData() {
  const result = await getInvoices().then(
    (invoices) => ({ invoices }),
    (error: unknown) => ({ error }),
  );
  if ("error" in result) return <BackendError error={result.error} />;
  return <StudioView invoices={result.invoices} />;
}

export default function StudioPage() {
  return (
    <>
      <PageHeader
        icon={Cpu}
        title="Extraction Studio"
        description="Upload a PDF, image or text receipt. The LangGraph pipeline ingests it (vision OCR for images), redacts PII, extracts a Pydantic-validated invoice, checks the math, retries with feedback when validation fails, and saves the result."
      />
      <Suspense fallback={<Skeleton className="h-[480px] w-full rounded-xl" />}>
        <StudioData />
      </Suspense>
    </>
  );
}
