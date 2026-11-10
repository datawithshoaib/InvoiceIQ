import { Suspense } from "react";
import type { Metadata } from "next";
import { Database } from "lucide-react";

import { BackendError } from "@/components/backend-error";
import { LedgerView } from "@/components/ledger/ledger-view";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getInvoices } from "@/lib/server-api";

export const metadata: Metadata = { title: "Ledger" };

async function LedgerData() {
  const result = await getInvoices().then(
    (invoices) => ({ invoices }),
    (error: unknown) => ({ error }),
  );
  if ("error" in result) return <BackendError error={result.error} />;
  return <LedgerView invoices={result.invoices} />;
}

export default function LedgerPage() {
  return (
    <>
      <PageHeader
        icon={Database}
        title="Expense Ledger"
        description="Every invoice stored by the extraction pipeline. These are the same rows the Text-to-SQL agent queries."
      />
      <Suspense fallback={<Skeleton className="h-[480px] w-full rounded-xl" />}>
        <LedgerData />
      </Suspense>
    </>
  );
}
