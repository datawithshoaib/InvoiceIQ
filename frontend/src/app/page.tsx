import { Sparkles } from "lucide-react";

import { Copilot } from "@/components/copilot/copilot";
import { PageHeader } from "@/components/page-header";

export default function AskPage() {
  return (
    <>
      <PageHeader
        icon={Sparkles}
        title="Ask InvoiceIQ"
        description="Ask questions in plain English. A LangGraph agent writes SQL, a sqlglot AST guardrail verifies it is a single read-only query over allow-listed tables, and it runs on a read-only connection. If the database or the guardrail rejects the query, the agent repairs it."
      />
      <Copilot />
    </>
  );
}
